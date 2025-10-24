# World-Kernel Platform

A collaborative platform for creative writing students to share, fork, and build upon world-building elements (characters, places, concepts, magic systems, etc.).

## Features

- **Fork-based Collaboration**: Build on others' world-kernels while maintaining attribution
- **Attribution Trails**: Track the ancestry and derivatives of each world-kernel
- **Tagging System**: Organize and discover kernels by tags
- **User Profiles**: Showcase your created and forked kernels
- **Search**: Find kernels by title, description, or tags

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Database & Auth**: Supabase
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd worldbuilding-network
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new project at [Supabase](https://app.supabase.com)

   b. Run the database schema (see `specification.md` for the SQL)

   c. Copy your project URL and anon key

4. **Configure environment variables**

   Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The database schema includes:

- **profiles**: User profiles with username, display name, and bio
- **kernels**: World-kernel entries with title, description, tags, and licensing
- **Row Level Security (RLS)**: Policies to protect user data

For the complete SQL schema, see the `specification.md` file.

### Setting up the database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL from `specification.md` (Database Schema section)
4. Run the SQL to create tables, indexes, and RLS policies

## Project Structure

```
worldbuilding-network/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── kernel/            # Kernel pages (view, create, fork)
│   ├── profile/           # User profile pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client configs
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
│   └── database.types.ts # Database types
├── middleware.ts          # Auth middleware
└── specification.md       # Complete project specification
```

## Development

### Running the dev server
```bash
npm run dev
```

### Building for production
```bash
npm run build
```

### Starting production server
```bash
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add these in your hosting provider:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Next Steps

After completing the setup:

1. **Authentication Pages**: Implement login and signup pages
2. **Kernel CRUD**: Create pages for creating, viewing, and forking kernels
3. **User Profiles**: Build user profile pages
4. **Search & Discovery**: Add search and tag filtering
5. **UI Polish**: Refine the design and user experience

See `specification.md` for detailed implementation guidelines.

## Contributing

This is a student project for creative writing clubs. Contributions and feedback are welcome!

## License

ISC

## Support

For issues and questions, please refer to the specification document or create an issue in the repository.
