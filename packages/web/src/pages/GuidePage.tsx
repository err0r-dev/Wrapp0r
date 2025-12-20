import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Activity, Music, UtensilsCrossed, DollarSign, Briefcase, Film, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataSource {
  name: string;
  url?: string;
  exportMethod: string;
  format: 'CSV' | 'JSON' | 'Excel';
}

interface CategoryGuide {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sources: DataSource[];
}

const CATEGORY_GUIDES: CategoryGuide[] = [
  {
    id: 'fitness',
    name: 'Fitness & Health',
    shortName: 'Fitness',
    description: 'Track your workouts, steps, and health metrics',
    icon: Activity,
    sources: [
      {
        name: 'Strava',
        url: 'https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export',
        exportMethod: 'Settings → My Account → Download or Delete Your Account → Request Your Archive',
        format: 'CSV',
      },
      {
        name: 'Garmin Connect',
        exportMethod: 'Settings → Account → Export Your Data',
        format: 'CSV',
      },
      {
        name: 'Fitbit',
        exportMethod: 'Settings → Data Export → Export My Data',
        format: 'CSV',
      },
      {
        name: 'Whoop',
        exportMethod: 'Settings → Export Data',
        format: 'CSV',
      },
    ],
  },
  {
    id: 'food',
    name: 'Food & Nutrition',
    shortName: 'Food',
    description: 'Analyse your eating habits and nutritional intake',
    icon: UtensilsCrossed,
    sources: [
      {
        name: 'MyFitnessPal',
        url: 'https://support.myfitnesspal.com/hc/en-us/articles/360032273352-Data-Export-FAQs',
        exportMethod: 'Reports → Export (Premium feature)',
        format: 'CSV',
      },
      {
        name: 'Cronometer',
        exportMethod: 'Settings → Account → Export Data',
        format: 'CSV',
      },
      {
        name: 'Lose It!',
        exportMethod: 'Me Tab → Settings → Export Data',
        format: 'CSV',
      },
      {
        name: 'Noom',
        exportMethod: 'Settings → Privacy → Download My Data',
        format: 'CSV',
      },
    ],
  },
  {
    id: 'music',
    name: 'Music & Listening',
    shortName: 'Music',
    description: 'Discover your top artists, genres, and listening habits',
    icon: Music,
    sources: [
      {
        name: 'Spotify',
        exportMethod: 'Account → Privacy Settings → Download your data',
        format: 'JSON',
      },
      {
        name: 'Last.fm',
        exportMethod: 'Settings → Export → Download scrobbles',
        format: 'CSV',
      },
      {
        name: 'Apple Music',
        exportMethod: 'Privacy → Request a copy of your data',
        format: 'JSON',
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Spending',
    shortName: 'Finance',
    description: 'Track your spending patterns and financial habits',
    icon: DollarSign,
    sources: [
      {
        name: 'Most Banks',
        exportMethod: 'Online Banking → Statements → Export/Download as CSV',
        format: 'CSV',
      },
      {
        name: 'Mint',
        exportMethod: 'Transactions → Export all transactions',
        format: 'CSV',
      },
      {
        name: 'YNAB',
        exportMethod: 'Settings → Export Budget → Export to CSV',
        format: 'CSV',
      },
      {
        name: 'Monzo',
        exportMethod: 'Account → Settings → Download statement',
        format: 'CSV',
      },
      {
        name: 'Revolut',
        exportMethod: 'Accounts → Statement → Export',
        format: 'CSV',
      },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity & Work',
    shortName: 'Work',
    description: 'Review your tasks, projects, and professional achievements',
    icon: Briefcase,
    sources: [
      {
        name: 'Jira',
        url: 'https://support.atlassian.com/jira-cloud-administration/docs/import-data-from-a-csv-file/',
        exportMethod: 'Issue Search → Export → CSV (current fields/all fields)',
        format: 'CSV',
      },
      {
        name: 'Linear',
        url: 'https://linear.app/docs/import-issues',
        exportMethod: 'Settings → Administration → Import/Export → Export CSV',
        format: 'CSV',
      },
      {
        name: 'Asana',
        url: 'https://asana.com/apps/csv-importer',
        exportMethod: 'Project → More actions → Export → CSV',
        format: 'CSV',
      },
      {
        name: 'GitHub',
        exportMethod: 'Issues → Use GitHub CLI or API to export',
        format: 'JSON',
      },
      {
        name: 'Trello',
        exportMethod: 'Board Menu → More → Print and Export → Export as JSON',
        format: 'JSON',
      },
      {
        name: 'Todoist',
        exportMethod: 'Settings → Account → Backup → Download backup',
        format: 'CSV',
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/help/linkedin/answer/a1339364/downloading-your-account-data',
        exportMethod: 'Settings → Data Privacy → Get a copy of your data',
        format: 'CSV',
      },
      {
        name: 'Slack',
        exportMethod: 'Workspace Settings → Import/Export → Export',
        format: 'JSON',
      },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    shortName: 'Media',
    description: 'Track what you watch and your viewing habits',
    icon: Film,
    sources: [
      {
        name: 'Letterboxd',
        url: 'https://letterboxd.com/journal/2025-letterboxd-year-in-review-faq/',
        exportMethod: 'Settings → Import & Export → Export Your Data',
        format: 'CSV',
      },
      {
        name: 'Trakt',
        exportMethod: 'Settings → Export → Export to CSV',
        format: 'CSV',
      },
      {
        name: 'IMDb',
        exportMethod: 'Your Ratings → Export (three dots menu)',
        format: 'CSV',
      },
      {
        name: 'Goodreads',
        exportMethod: 'My Books → Import and export → Export Library',
        format: 'CSV',
      },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    shortName: 'Gaming',
    description: 'Review your gaming stats and achievements',
    icon: Gamepad2,
    sources: [
      {
        name: 'Steam',
        exportMethod: 'Account → Data Privacy → View/Delete Personal Data → Request Data',
        format: 'JSON',
      },
      {
        name: 'PlayStation',
        exportMethod: 'Account Settings → Privacy → Request Your Data',
        format: 'JSON',
      },
      {
        name: 'Xbox',
        exportMethod: 'Account → Data privacy → Export your data',
        format: 'JSON',
      },
    ],
  },
];

function getFormatBadgeColor(format: DataSource['format']) {
  switch (format) {
    case 'CSV':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'JSON':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'Excel':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
  }
}

export function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          What Can I Wrap?
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-white/70">
          Export data from your favourite apps and create a personalised "Wrapped" experience.
          Here's how to get your data from popular services.
        </p>
      </motion.div>

      {/* Tabbed Category guides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="fitness" className="w-full">
          <TabsList className="flex w-full flex-wrap h-auto gap-1 p-1 bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10">
            {CATEGORY_GUIDES.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 data-[state=active]:bg-black/10 dark:data-[state=active]:bg-white/10 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-white/60"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CATEGORY_GUIDES.map((category) => {
            const Icon = category.icon;
            return (
              <TabsContent key={category.id} value={category.id}>
                <Card className="bg-black/5 dark:bg-white/5 backdrop-blur-xl border-black/10 dark:border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 dark:text-white">{category.name}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-white/60">{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.sources.map((source) => (
                        <div
                          key={source.name}
                          className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">{source.name}</h4>
                                {source.url && (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
                                {source.exportMethod}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${getFormatBadgeColor(source.format)}`}>
                              {source.format}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </motion.div>

      {/* Tips section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-primary/30 bg-primary/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700 dark:text-white/80">
            <p>
              <strong className="text-gray-900 dark:text-white">File format:</strong> CSV, Excel (.xlsx), and JSON files are all supported.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Date range:</strong> For year-end wraps, export data for the full year if possible.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Column names:</strong> Keep original column names - our AI understands common formats from popular apps.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
