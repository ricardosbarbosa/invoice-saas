import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Mail,
  Github,
} from "lucide-react";

export default function CVPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:px-8">
        {/* Header Section */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <CardTitle className="text-4xl font-bold text-foreground">
                  Ricardo Barbosa
                </CardTitle>
                <CardDescription className="text-lg">
                  Front-end Developer
                </CardDescription>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>João Pessoa - State of Paraíba, Brazil</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Member since October 13, 2020</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-muted-foreground">Contact</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span className="text-muted-foreground">GitHub</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Experienced full-stack web developer with a focus on front-end
              development. Leverages modern technologies and creativity to
              deliver high-quality results. Enjoys coding and using skills to
              create practical and innovative solutions that offer functionality
              and joy to end users. Brings a strong work ethic, attention to
              detail, and a team-oriented mindset to every project, consistently
              delivering projects that exceed expectations.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Senior Front-end Developer - Bilt */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Senior Front-end Developer
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        Bilt Technologies Inc
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      2024 - 2025
                    </Badge>
                  </div>
                  <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
                    <li>
                      Enhanced the core React and Next.js codebase by
                      standardizing component patterns, tightening TypeScript
                      typing across critical user-flows, and cutting UI-related
                      regressions by around 30% through consistent best-practice
                      enforcement.
                    </li>
                    <li>
                      Delivered high-impact front-end features tied to the
                      loyalty and rewards pipelines, improving load times on key
                      renter dashboards by 25-35%, while partnering closely with
                      back-end and design teams to keep platform UX fast and
                      stable at scale.
                    </li>
                    <li>
                      Implemented CI-ready testing coverage using Playwright and
                      structured Redux state slices for legacy areas, increasing
                      automated test reliability by around 20% and reducing
                      manual QA time per release cycle.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Next.js",
                      "React",
                      "TypeScript",
                      "Vercel",
                      "Redux",
                      "Playwright",
                    ].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Senior Front-end Engineer - Choozle */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Senior Front-end Engineer
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        Choozle, Inc.
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      2023 - 2024
                    </Badge>
                  </div>
                  <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
                    <li>
                      Optimized ad campaign management tools. Led the
                      development of features that allowed marketers to easily
                      create, manage, and optimize programmatic ad campaigns.
                    </li>
                    <li>
                      Collaborated cross-functionally with the product and UX
                      teams on new features, translating user feedback into
                      actionable design improvements.
                    </li>
                    <li>
                      Implemented responsive web design for the ad platform.
                      Designed and developed dynamic, responsive UI for the
                      Choozle ad platform, ensuring seamless performance across
                      desktop, tablet, and mobile devices, improving the overall
                      user experience.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "React",
                      "Next.js",
                      "Redux",
                      "React Redux",
                      "LaunchDarkly",
                    ].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Full-stack Developer - Humain */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Full-stack Developer
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        Humain Co. LLC
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      2023 - 2023
                    </Badge>
                  </div>
                  <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
                    <li>
                      Developed a full-stack Next.js application with
                      DigitalOcean for the database and storage, Vercel for
                      deployment, and Auth0 for authentication.
                    </li>
                    <li>
                      Crafted a visually appealing UI that perfectly aligns with
                      the client&apos;s design using Ant Design and Ant Design
                      Pro.
                    </li>
                    <li>
                      Created an admin dashboard for the owner to manage client
                      data. Delivered on time despite being out of scope, with
                      the main features prioritized.
                    </li>
                    <li>
                      Structured the database by integrating the ORM and Prisma.
                      Prisma&apos;s API has made managing and manipulating data
                      more efficient and streamlined.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "React",
                      "Next.js",
                      "Prisma",
                      "PostgreSQL",
                      "DigitalOcean",
                      "TypeScript",
                      "Vercel",
                      "Auth0",
                      "Ant Design",
                    ].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* React Developer - Motorola */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">React Developer</h3>
                      <p className="text-sm font-medium text-primary">
                        Motorola Solutions - Openpath
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      2022 - 2023
                    </Badge>
                  </div>
                  <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
                    <li>
                      Implemented internationalization for the web and mobile
                      application, supporting five languages. This has greatly
                      improved our user experience and helped us to expand our
                      reach globally.
                    </li>
                    <li>
                      Tracked and fixed bugs using Jira as a reporting tool.
                    </li>
                    <li>
                      Provided clear and comprehensive instructions to new team
                      members on how to effectively implement
                      internationalization in both the web and React Native
                      applications.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "React",
                      "JavaScript",
                      "i18n",
                      "TypeScript",
                      "Redux",
                      "ReduxSaga",
                      "Next.js",
                      "React Query",
                      "Antd",
                    ].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* React Developer - Play One Up */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">React Developer</h3>
                      <p className="text-sm font-medium text-primary">
                        One Up Group LLC dba Play One Up
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      2021 - 2022
                    </Badge>
                  </div>
                  <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
                    <li>
                      Worked on a betting platform and implemented a GraphQL API
                      using Apollo client that improved the scalability and
                      performance of the application, resulting in a 25%
                      increase in the number of concurrent users.
                    </li>
                    <li>
                      Designed and developed a real-time notification system
                      using Firebase that reduced the response time for critical
                      events by 50% and increased user engagement.
                    </li>
                    <li>
                      Redesigned the user interface using Material UI and
                      TypeScript, resulting in a 30% improvement in user
                      satisfaction and a 20% reduction in user error rates.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "React",
                      "TypeScript",
                      "Firebase",
                      "Material UI",
                      "GraphQL",
                      "React Apollo",
                    ].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* React Front-end Expert - ThisWay */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        React Front-end Expert
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        ThisWay Global LLC
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      2020 - 2021
                    </Badge>
                  </div>
                  <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
                    <li>
                      Developed and deployed a new feature that improved user
                      engagement by 20% through React Redux and Ant Design.
                    </li>
                    <li>
                      Streamlined the codebase and reduced the page load time by
                      30% through code optimizations and implementing best
                      practices.
                    </li>
                    <li>
                      Collaborated with the design team to create reusable UI
                      components in Ant Design that reduced development time for
                      new features by 50%.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "React",
                      "JavaScript",
                      "TypeScript",
                      "Redux",
                      "React Redux",
                      "Antd",
                    ].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Front-end Developer - IQVIA */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Front-end Developer with React
                      </h3>
                      <p className="text-sm font-medium text-primary">IQVIA</p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      2019 - 2020
                    </Badge>
                  </div>
                  <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
                    <li>
                      Created a UI interface in React after attending onboarding
                      in Seattle to meet the UI team who created the Material
                      UI-based library that I would use.
                    </li>
                    <li>
                      Built the application from scratch, defining architecture
                      and partners to be used when new developers came in.
                    </li>
                    <li>
                      Collaborated closely with colleagues using Scrum/Kanban to
                      manage workflow.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {["Material UI", "Redux", "React"].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Portfolio & Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    Play One Up Betting Platform
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A React web application that enables admin users to manage
                    online gaming and sports betting activities. Features
                    include player management, game management, tournament
                    management, and promotional ticket management.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "GraphQL", "Firebase", "Material UI"].map(
                      (tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">
                    This Way Global Matching Platform
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    An innovative platform to revolutionize the hiring process
                    by providing an unbiased candidate sourcing and matching
                    engine for talent acquisition. Uses machine learning
                    algorithms to analyze candidates&apos; skills and match them
                    with relevant job opportunities.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "Redux", "Ant Design"].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">
                    IQVIA Transparency Reporting
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A software solution designed to help life sciences companies
                    comply with global transparency and disclosure regulations
                    by providing a centralized platform to collect, manage, and
                    report data related to payments and transfers of value to
                    healthcare professionals and organizations.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "Material UI", "Redux"].map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Languages</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "JavaScript",
                      "TypeScript",
                      "CSS",
                      "HTML",
                      "SQL",
                      "Python",
                      "GraphQL",
                    ].map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Frameworks</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "React",
                      "Next.js",
                      "Redux",
                      "Tailwind CSS",
                      "Django",
                      "Flask",
                      "Material UI",
                      "Express.js",
                      "Ant Design",
                    ].map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Tools</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Git",
                      "GitHub",
                      "Prisma",
                      "Auth0",
                      "Firebase",
                      "Jira",
                      "Figma",
                      "Playwright",
                    ].map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    Experience Years
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Front-end Development
                      </span>
                      <span className="font-medium">10 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">React</span>
                      <span className="font-medium">7 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next.js</span>
                      <span className="font-medium">4 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FastAPI</span>
                      <span className="font-medium">3 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Django</span>
                      <span className="font-medium">3 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Python</span>
                      <span className="font-medium">3 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Node.js</span>
                      <span className="font-medium">2 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tailwind CSS
                      </span>
                      <span className="font-medium">2 years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    Bachelor&apos;s Degree in Computer Science
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Universidade Federal da Paraíba
                  </p>
                  <p className="text-sm text-muted-foreground">
                    João Pessoa, Paraíba, Brazil
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    2003 - 2007
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Certifications Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    Multi-Style Tailwind Components
                  </h4>
                  <p className="text-xs text-muted-foreground">Pro Tailwind</p>
                  <p className="text-xs text-muted-foreground">
                    March 2023 - Present
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    Tailwind Multi-Theme Strategy
                  </h4>
                  <p className="text-xs text-muted-foreground">Pro Tailwind</p>
                  <p className="text-xs text-muted-foreground">
                    January 2023 - Present
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Testing JavaScript</h4>
                  <p className="text-xs text-muted-foreground">Kent C. Dodds</p>
                  <p className="text-xs text-muted-foreground">
                    January 2022 - Present
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Epic React</h4>
                  <p className="text-xs text-muted-foreground">Kent C. Dodds</p>
                  <p className="text-xs text-muted-foreground">
                    January 2022 - Present
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    React Developer Nanodegree
                  </h4>
                  <p className="text-xs text-muted-foreground">Udacity</p>
                  <p className="text-xs text-muted-foreground">
                    January 2018 - Present
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    iOS Developer Nanodegree
                  </h4>
                  <p className="text-xs text-muted-foreground">Udacity</p>
                  <p className="text-xs text-muted-foreground">
                    April 2017 - Present
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    Android Developer Nanodegree
                  </h4>
                  <p className="text-xs text-muted-foreground">Udacity</p>
                  <p className="text-xs text-muted-foreground">
                    March 2017 - Present
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
