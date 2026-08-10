# CORA MVP - Pilot Demo Walkthrough

## Setup / Prerequisites
1. Ensure the app is deployed on Vercel.
2. Sign in with the approved RVU Google account. New `@rvu.edu.in` accounts appear as pending access requests.
3. Ensure the database has been seeded with `admin.seedDemoData`.

## Step 1: Login
- **Action**: Go to the Vercel app URL (`/login`).
- **Action**: Click "Continue with Google Workspace" and complete Google sign-in.
- **Result**: You are authenticated and redirected to the `/` dashboard. Notice the personalized greeting ("Welcome, [Name]").

## Step 2: Dashboard Overview
- **Action**: Review the Dashboard metrics.
- **Talking Point**: "Here is the unified view of our relationships. We can see the total number of corporate partners, alumni in the network, and the recent interactions logged by our team."
- **Action**: Point out the "Ask AI" search box.

## Step 3: Semantic Search (AI Feature)
- **Action**: In the "Ask AI" box on the dashboard, type: `Alumni working in software or technology`.
- **Action**: Press "Ask AI".
- **Result**: The local semantic search runs and displays ranked matches for alumni whose embeddings closely match the concept of software/technology.
- **Talking Point**: "Instead of just searching by name, we use AI to find alumni based on context. This is running completely locally and privately."

## Step 4: Companies View
- **Action**: Click on "Companies" in the left sidebar.
- **Result**: Shows a clean, grid-based list of corporate partners (e.g., Acme Corp, Global Tech).
- **Action**: Click on "Global Tech" to open its detail view.
- **Result**: Shows the company details, industry, and a history of interactions at the bottom.

## Step 5: Alumni View & Logging Interactions
- **Action**: Click on "Alumni" in the left sidebar.
- **Result**: Shows the list of alumni (e.g., Alice Smith, Bob Johnson).
- **Action**: Click on "Bob Johnson".
- **Result**: Shows Bob's profile, graduation year, and current company.
- **Action**: Scroll down to the "Interactions Log".
- **Action**: Use the form to log a new interaction:
  - **Type**: `Call`
  - **Notes**: `Great catch up! Bob is interested in the upcoming mentorship drive.`
  - **Click**: Save Interaction.
- **Result**: The interaction instantly appears in the timeline above.
- **Talking Point**: "We can track every touchpoint with our alumni here, building institutional memory."

## Step 6: Global Search
- **Action**: In the top navigation bar's search input, type `Charlie`.
- **Result**: The global search finds "Charlie Brown" under Alumni.
- **Action**: Click the result to jump straight to their profile.
