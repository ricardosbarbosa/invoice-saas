import { Github, Linkedin, Mail } from "lucide-react";

export default function CVPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <article className="prose prose-slate max-w-none">
          <header>
            <h1>Ricardo Barbosa</h1>
            <p>
              <strong>Full Stack Engineer</strong>
            </p>
            <p>João Pessoa - State of Paraíba, Brazil</p>
            <ul className="list-none pl-0">
              <li>
                <a
                  className="flex items-center gap-2"
                  href="mailto:rbrico@gmail.com"
                >
                  <Mail className="h-4 w-4 text-slate-600" />
                  <span>rbrico@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-2"
                  href="https://github.com/ricardosbarbosa"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4 text-slate-600" />
                  <span>github.com/ricardosbarbosa</span>
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-2"
                  href="https://www.linkedin.com/in/ricardosousabarbosa/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="h-4 w-4 text-slate-600" />
                  <span>linkedin.com/in/ricardosousabarbosa</span>
                </a>
              </li>
            </ul>
            <p>
              Software engineer with a front-end focus, combining{" "}
              <strong>performance</strong>, <strong>quality</strong>, and{" "}
              <strong>user experience</strong> to ship reliable products at
              scale. I have a track record of{" "}
              <strong>technical leadership</strong> in React/Next.js—raising
              component standards, strengthening TypeScript across critical user
              flows, and improving confidence through testing (e.g. Playwright).
              I enjoy partnering closely with product and design to turn complex
              requirements into interfaces that are simple, fast, and easy to
              maintain.
            </p>
          </header>

          <hr />

          <section>
            <h2>Professional Experience</h2>

            <h3>
              Senior Front-end Developer — Bilt Technologies Inc (2024 - 2025)
            </h3>
            <ul>
              <li>
                Enhanced the core React and Next.js codebase by standardizing
                component patterns, tightening TypeScript typing across critical
                user-flows, and cutting UI-related regressions by around 30%
                through consistent best-practice enforcement.
              </li>
              <li>
                Delivered high-impact front-end features tied to the loyalty and
                rewards pipelines, improving load times on key renter dashboards
                by 25-35%, while partnering closely with back-end and design
                teams to keep platform UX fast and stable at scale.
              </li>
              <li>
                Implemented CI-ready testing coverage using Playwright and
                structured Redux state slices for legacy areas, increasing
                automated test reliability by around 20% and reducing manual QA
                time per release cycle.
              </li>
            </ul>
            <p>
              <strong>Tech</strong>: Next.js, React, TypeScript, Vercel, Redux,
              Playwright
            </p>

            <h3>Senior Front-end Engineer — Choozle, Inc. (2023 - 2024)</h3>
            <ul>
              <li>
                Optimized ad campaign management tools. Led the development of
                features that allowed marketers to easily create, manage, and
                optimize programmatic ad campaigns.
              </li>
              <li>
                Collaborated cross-functionally with the product and UX teams on
                new features, translating user feedback into actionable design
                improvements.
              </li>
              <li>
                Implemented responsive web design for the ad platform. Designed
                and developed dynamic, responsive UI for the Choozle ad
                platform, ensuring seamless performance across desktop, tablet,
                and mobile devices, improving the overall user experience.
              </li>
            </ul>
            <p>
              <strong>Tech</strong>: React, Next.js, Redux, React Redux,
              LaunchDarkly
            </p>

            <h3>Full-stack Developer — Humain Co. LLC (2023)</h3>
            <ul>
              <li>
                Developed a full-stack Next.js application with DigitalOcean for
                the database and storage, Vercel for deployment, and Auth0 for
                authentication.
              </li>
              <li>
                Crafted a visually appealing UI that perfectly aligns with the
                client&apos;s design using Ant Design and Ant Design Pro.
              </li>
              <li>
                Created an admin dashboard for the owner to manage client data.
                Delivered on time despite being out of scope, with the main
                features prioritized.
              </li>
              <li>
                Structured the database by integrating the ORM and Prisma.
                Prisma&apos;s API has made managing and manipulating data more
                efficient and streamlined.
              </li>
            </ul>
            <p>
              <strong>Tech</strong>: React, Next.js, Prisma, PostgreSQL,
              DigitalOcean, TypeScript, Vercel, Auth0, Ant Design
            </p>

            <h3>
              React Developer — Motorola Solutions - Openpath (2022 - 2023)
            </h3>
            <ul>
              <li>
                Implemented internationalization for the web and mobile
                application, supporting five languages. This has greatly
                improved our user experience and helped us to expand our reach
                globally.
              </li>
              <li>Tracked and fixed bugs using Jira as a reporting tool.</li>
              <li>
                Provided clear and comprehensive instructions to new team
                members on how to effectively implement internationalization in
                both the web and React Native applications.
              </li>
            </ul>
            <p>
              <strong>Tech</strong>: React, JavaScript, i18n, TypeScript, Redux,
              ReduxSaga, Next.js, React Query, Antd
            </p>

            <h3>
              React Developer — One Up Group LLC dba Play One Up (2021 - 2022)
            </h3>
            <ul>
              <li>
                Worked on a betting platform and implemented a GraphQL API using
                Apollo client that improved the scalability and performance of
                the application, resulting in a 25% increase in the number of
                concurrent users.
              </li>
              <li>
                Designed and developed a real-time notification system using
                Firebase that reduced the response time for critical events by
                50% and increased user engagement.
              </li>
              <li>
                Redesigned the user interface using Material UI and TypeScript,
                resulting in a 30% improvement in user satisfaction and a 20%
                reduction in user error rates.
              </li>
            </ul>
            <p>
              <strong>Tech</strong>: React, TypeScript, Firebase, Material UI,
              GraphQL, React Apollo
            </p>

            <h3>React Front-end Expert — ThisWay Global LLC (2020 - 2021)</h3>
            <ul>
              <li>
                Developed and deployed a new feature that improved user
                engagement by 20% through React Redux and Ant Design.
              </li>
              <li>
                Streamlined the codebase and reduced the page load time by 30%
                through code optimizations and implementing best practices.
              </li>
              <li>
                Collaborated with the design team to create reusable UI
                components in Ant Design that reduced development time for new
                features by 50%.
              </li>
            </ul>
            <p>
              <strong>Tech</strong>: React, JavaScript, TypeScript, Redux, React
              Redux, Antd
            </p>

            <h3>Front-end Developer with React — IQVIA (2019 - 2020)</h3>
            <ul>
              <li>
                Created a UI interface in React after attending onboarding in
                Seattle to meet the UI team who created the Material UI-based
                library that I would use.
              </li>
              <li>
                Built the application from scratch, defining architecture and
                partners to be used when new developers came in.
              </li>
              <li>
                Collaborated closely with colleagues using Scrum/Kanban to
                manage workflow.
              </li>
            </ul>
            <p>
              <strong>Tech</strong>: Material UI, Redux, React
            </p>
          </section>

          <hr />

          <section>
            <h2>Portfolio &amp; Projects</h2>

            <h3>Play One Up Betting Platform</h3>
            <p>
              A React web application that enables admin users to manage online
              gaming and sports betting activities. Features include player
              management, game management, tournament management, and
              promotional ticket management.
            </p>
            <p>
              <strong>Tech</strong>: React, GraphQL, Firebase, Material UI
            </p>

            <h3>This Way Global Matching Platform</h3>
            <p>
              An innovative platform to revolutionize the hiring process by
              providing an unbiased candidate sourcing and matching engine for
              talent acquisition. Uses machine learning algorithms to analyze
              candidates&apos; skills and match them with relevant job
              opportunities.
            </p>
            <p>
              <strong>Tech</strong>: React, Redux, Ant Design
            </p>

            <h3>IQVIA Transparency Reporting</h3>
            <p>
              A software solution designed to help life sciences companies
              comply with global transparency and disclosure regulations by
              providing a centralized platform to collect, manage, and report
              data related to payments and transfers of value to healthcare
              professionals and organizations.
            </p>
            <p>
              <strong>Tech</strong>: React, Material UI, Redux
            </p>
          </section>

          <hr />

          <section>
            <h2>Skills</h2>

            <h3>Languages</h3>
            <p>JavaScript, TypeScript, CSS, HTML, SQL, Python, GraphQL</p>

            <h3>Frameworks</h3>
            <p>
              React, Next.js, Redux, Tailwind CSS, Django, Flask, Material UI,
              Express.js, Ant Design
            </p>

            <h3>Tools</h3>
            <p>Git, GitHub, Prisma, Auth0, Firebase, Jira, Figma, Playwright</p>

            <h3>Experience Years</h3>
            <ul>
              <li>
                <strong>Front-end Development</strong>: 10 years
              </li>
              <li>
                <strong>React</strong>: 7 years
              </li>
              <li>
                <strong>Next.js</strong>: 4 years
              </li>
              <li>
                <strong>FastAPI</strong>: 3 years
              </li>
              <li>
                <strong>Django</strong>: 3 years
              </li>
              <li>
                <strong>Python</strong>: 3 years
              </li>
              <li>
                <strong>Node.js</strong>: 2 years
              </li>
              <li>
                <strong>Tailwind CSS</strong>: 2 years
              </li>
            </ul>
          </section>

          <hr />

          <section>
            <h2>Education</h2>
            <p>
              <strong>Bachelor&apos;s Degree in Computer Science</strong>
              <br />
              Universidade Federal da Paraíba
              <br />
              João Pessoa, Paraíba, Brazil
              <br />
              2003 - 2007
            </p>
          </section>

          <hr />

          <section>
            <h2>Certifications</h2>
            <ul>
              <li>
                <strong>Multi-Style Tailwind Components</strong> — Pro Tailwind
                (March 2023 - Present)
              </li>
              <li>
                <strong>Tailwind Multi-Theme Strategy</strong> — Pro Tailwind
                (January 2023 - Present)
              </li>
              <li>
                <strong>Testing JavaScript</strong> — Kent C. Dodds (January
                2022 - Present)
              </li>
              <li>
                <strong>Epic React</strong> — Kent C. Dodds (January 2022 -
                Present)
              </li>
              <li>
                <strong>React Developer Nanodegree</strong> — Udacity (January
                2018 - Present)
              </li>
              <li>
                <strong>iOS Developer Nanodegree</strong> — Udacity (April 2017
                - Present)
              </li>
              <li>
                <strong>Android Developer Nanodegree</strong> — Udacity (March
                2017 - Present)
              </li>
            </ul>
          </section>
        </article>
      </main>
    </div>
  );
}
