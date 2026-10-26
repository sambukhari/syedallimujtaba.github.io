# APAEA - Project Modules and Features

**Repository:** https://gitlab.com/sambukhari/apaea  
**Source:** `main` @ `b0035edcc762299274b2da46345ded202b2a672b`  
**Scope:** Custom modules in source; short descriptions only. "Present" means implemented code exists, not verified production usage.

| # | Module | Short details | Source status |
|---|---|---|---|
| 1 | User Management | Member signup, login, email verification, profiles and admin user records. | Present |
| 2 | API for App | Eight routes for login, registration, account/review lookup and public content. | Present (limited) |
| 3 | KYC | No document-based identity verification or KYC approval workflow found. | Not found |
| 4 | HR Management System | No employee, attendance, leave, payroll or salary management found. | Not found |
| 5 | Admin Panel | Separate admin authentication, dashboard and management screens. | Present |
| 6 | Individual Membership | Member registration, application records and activation/payment. | Present |
| 7 | Institutional Membership | Organization membership forms, members, status and payments. | Present |
| 8 | Membership Payments | PayPal individual/institutional payments and admin payment links. | Present |
| 9 | Conference Management | Create, edit and publish conferences. | Present |
| 10 | Conference Paper Submission | Authors submit conference papers and files. | Present |
| 11 | Conference Paper Review | Assign reviewers, collect replies, manage decisions/history. | Present |
| 12 | Conference Proceedings | Publish and manage conference proceedings. | Present |
| 13 | General Paper Submission | Publication submission forms, records and admin oversight. | Present |
| 14 | Submission Portal | Public submission portal and feedback handling. | Present |
| 15 | Paper Review Service | Review requests, reviewer assignment, feedback and payment. | Present |
| 16 | Proofreading Service | Manuscript proofreading requests, assignments, feedback and payment. | Present |
| 17 | Working Papers | Create and publish working-paper series entries. | Present |
| 18 | Working Paper Review | Submit working papers, assign reviewers, track decisions/history. | Present |
| 19 | Journal Management | Journal records, public journal pages and admin editing. | Present |
| 20 | Journal Archives | Journal issues/categories, archive and RePEc metadata records. | Present |
| 21 | Research Indexing | Manage journal indexing pages and related content. | Present |
| 22 | Events & Conferences | List forums, workshops and upcoming conferences. | Present |
| 23 | Event Registration | Event signup/payment and confirmation handlers. | Present |
| 24 | Event Categories & Managers | Administer event categories and event manager entries. | Present |
| 25 | Governance & Designations | Publish governance/faculty profiles and titles; not an HR suite. | Present |
| 26 | CMS Pages | Edit and publish site pages, privacy/terms and about content. | Present |
| 27 | News Management | News articles and categories with public detail pages. | Present |
| 28 | Partners | Manage and display partner profiles. | Present |
| 29 | FAQs | Add, update and display frequently asked questions. | Present |
| 30 | Gallery | Albums, photo upload and gallery pages. | Present |
| 31 | Videos | Administer video entries and public video page. | Present |
| 32 | Research Datasets | Administer and publish dataset listings. | Present |
| 33 | Contact & Email | Contact form and email templates for notices/invitations. | Present |
| 34 | Site Settings & Localization | Admin options, conditional login protection and language selection. | Present |
| 35 | Member Dashboard | Member account and assigned/research submission information. | Present |
| 36 | PayPal Payment Handling | Checkout/status/success handlers across several service modules. | Present; live status unverified |

## Notes for accurate use

- **KYC and HR:** Email verification, governance titles, and event managers do **not** establish KYC or HR/payroll modules.
- **App API:** Only eight registered API endpoints were found; do not assume full mobile CRUD, KYC, payment or HR APIs.
- **Database:** Much business data is accessed through `DB::table(...)`; corresponding migration definitions are missing for many tables.
- **Production status:** PayPal, email, protected routes and actual deployments were not tested.
- **AI coding reference:** See `APAEA_AI_CONTEXT.md` for routes, controller locations, database tables, workflows and safety notes.

**Read-only deliverable:** These two Markdown files were prepared outside GitLab. No branch, commit or repository file was changed.