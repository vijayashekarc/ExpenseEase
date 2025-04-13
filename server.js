require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// Session configuration
app.use(session({
  secret: 'expenseease-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // First check if email exists in Supabase
      const { data: emailUser, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', profile.emails[0].value)
        .single();

      if (emailError && emailError.code !== 'PGRST116') {
        throw emailError;
      }

      // If email exists and has a password_hash (non-Google account)
      if (emailUser && emailUser.password_hash) {
        // Update the user with Google ID for future reference
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ google_id: profile.id })
          .eq('id', emailUser.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return done(null, updatedUser);
      }

      // Check if Google ID exists
      const { data: googleUser, error: googleError } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', profile.id)
        .single();

      if (googleError && googleError.code !== 'PGRST116') {
        throw googleError;
      }

      if (googleUser) {
        return done(null, googleUser);
      }

      // Create new user in Supabase
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            google_id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar_url: profile.photos[0].value
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Local Strategy for email/password login
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Check if user exists in Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return done(null, false, { message: 'User not found' });
      }

      // If user has a Google ID but no password, they need to use Google login
      if (user.google_id && !user.password_hash) {
        return done(null, false, { message: 'Please use Google login for this account' });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/add-expense', (req, res) => {
  res.sendFile(path.join(__dirname, 'add-expense.html'));
});

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/home.html');
  }
);

app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Supabase configuration endpoints
app.get('/api/supabase-url', (req, res) => {
  res.json(process.env.SUPABASE_URL);
});

app.get('/api/supabase-anon-key', (req, res) => {
  res.json(process.env.SUPABASE_ANON_KEY);
});

// API routes for expenses
// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Get all expenses for the current user
app.get('/api/expenses', isAuthenticated, async (req, res) => {
  try {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add a new expense
app.post('/api/expenses', isAuthenticated, async (req, res) => {
  try {
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: req.user.id,
          expense_name: req.body.expense_name,
          amount: parseFloat(req.body.amount),
          job_role: req.body.job_role,
          payment_method: req.body.payment_method
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Update an expense
app.put('/api/expenses/:id', isAuthenticated, async (req, res) => {
  try {
    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        expense_name: req.body.expense_name,
        amount: parseFloat(req.body.amount),
        job_role: req.body.job_role,
        payment_method: req.body.payment_method
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete an expense
app.delete('/api/expenses/:id', isAuthenticated, async (req, res) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// User info endpoint
app.get('/api/user-info', isAuthenticated, (req, res) => {
    try {
        // Return user information from the session
        const userInfo = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            avatar_url: req.user.avatar_url,
            created_at: req.user.created_at
        };
        res.json(userInfo);
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Failed to fetch user information' });
    }
});

// Local auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      if (existingUser.google_id) {
        return res.status(400).json({ error: 'This email is already registered with Google. Please use Google login.' });
      }
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Automatically log in the new user
    req.login(newUser, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: 'Failed to login after registration' });
      }
      return res.status(201).json(newUser);
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, user: req.user });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 