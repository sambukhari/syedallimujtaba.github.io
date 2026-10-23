# EzeAD-1 — Full functional and module inventory

**Repository:** https://github.com/ashiq/ezead-1  
**Baseline commit:** 39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1  
**Reviewed:** 2026-10-23  
**Pair with:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)

## Reading the status column
- **Source-implemented** means code paths, controllers/models/routes exist at the pinned commit; it does not demonstrate features are running in production.
- **Code present / unverified** means adapters, route registration, settings or workflows were observed but configuration/activation/deployment cannot be confirmed.
- **Not found in inspected business modules** means there is no reliable evidence to claim that feature; it is not a proof of nonexistence in other linked projects or remote services.
- **Separate application** means public/core/ Laravel 8, not the primary classifieds app. Do not merge the two feature lists.

## Executive functional summary
The main system is a classified-ads marketplace with multilingual multi-country catalog/listings, custom category fields, user/member profiles, shop pages, listing and product publishing, moderation, search and location filters, saved searches/favourites, private messaging, subscriptions/PayPal, listing boosts, advertising/promotions, a CMS/blog, SEO/sitemaps, AI-assisted copy, KYC, administrative CRUD/roles and visitor-to-agent/AI support.

The repository ALSO contains a distinct Laravel 8 storefront within public/core/ implementing catalog, cart, coupons, checkout/shipping, orders/invoices, ratings, wishlist, support tickets, user balances, deposits and withdrawals, payment gateways (including Stripe), and a separate admin/API surface.

**Not confirmed:** actual production deployment/traffic, Stripe in the main app, scheduled expiry commands running automatically, completed third-party credentials, HR management or payroll. See evidence and limits below.

## Module-by-module evidence

## Main — Identity (10 modules)

### 01. User registration and login

**Functionality:** Separate browser and API login flows, account creation, logout, form validation, auth field checks and sessions/tokens. The API login code uses custom auth helpers; inspect actual route middleware before consuming authenticated endpoints.

**Data/contracts:** User; PasswordReset; personal access tokens.

**Implementation status:** Source-implemented; deployment unverified.

**Source files:** [Auth/RegisterController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Auth/RegisterController.php) · [Auth/LoginController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Auth/LoginController.php) · [Auth/LoginController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/Auth/LoginController.php) · [User/Register.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/User/Register.php).

### 02. Password reset and account recovery

**Functionality:** Email or phone reset token flow, forgotten-password actions and password change. Verification code traits exist for both API and browser clients.

**Data/contracts:** PasswordReset; User.

**Implementation status:** Source-implemented.

**Source files:** [Auth/ForgotPasswordController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Auth/ForgotPasswordController.php) · [Auth/ResetPasswordController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Auth/ResetPasswordController.php) · [Auth/ForgotPasswordController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/Auth/ForgotPasswordController.php) · [Auth/ResetPasswordController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/Auth/ResetPasswordController.php).

### 03. Social login and OAuth callbacks

**Functionality:** Provider redirects and callbacks handled by Web/Auth/SocialController and Api/Auth/SocialController. A second ThirdPartyLogin controller contains Google, Facebook, LinkedIn, Twitter methods; some older web routes are commented, so confirm reachable paths per provider.

**Data/contracts:** User; provider identity.

**Implementation status:** Provider handlers present; actual configuration/reachability unverified.

**Source files:** [Auth/SocialController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Auth/SocialController.php) · [Auth/ThiredParttyLoginController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Auth/ThiredParttyLoginController.php) · [Auth/SocialController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/Auth/SocialController.php) · [config/services.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/config/services.php).

### 04. Email and telephone verification

**Functionality:** Verification request/resend and code checks, email/phone channel resolution, captcha, registration safety checks and contact phone validation.

**Data/contracts:** User email_verified_at; phone_verified_at; verification tokens.

**Implementation status:** Source-implemented.

**Source files:** [Traits/VerificationTrait.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/Auth/Traits/VerificationTrait.php) · [Notifications/EmailVerificationCode.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/EmailVerificationCode.php) · [Notifications/PhoneVerification.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/PhoneVerification.php) · [Models/PasswordReset.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/PasswordReset.php).

### 05. User profile and account preferences

**Functionality:** Public profile, profile image, change details, language/country, user type, cover photo, social links, contact fields, browser theme and settings. User profile API includes photo update endpoints.

**Data/contracts:** User; UserDetail; UserType; country/location.

**Implementation status:** Source-implemented.

**Source files:** [Account/EditController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/EditController.php) · [Api/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/UserController.php) · [Models/User.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/User.php) · [Models/UserDetail.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/UserDetail.php).

### 06. Account closure and data deletion

**Functionality:** Browser account close endpoint delegates to API user deletion logic; privacy instructions describe email/contact path. The Meta public data-deletion instructions are not a server-to-server signed deletion callback.

**Data/contracts:** User; posts; personal data dependencies.

**Implementation status:** Source-implemented; end-to-end deletion not proven.

**Source files:** [Account/CloseController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/CloseController.php) · [User/Delete.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/User/Delete.php) · [docs/privacy-policy-meta-compliance.md](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/docs/privacy-policy-meta-compliance.md).

### 07. Roles, permissions and agent access

**Functionality:** Spatie role/permission management, API clearance, Admin login, staff permissions, super-admin setup, impersonation and role:agent middleware for staff support. Verify route authorization per action.

**Data/contracts:** Role; Permission; User.

**Implementation status:** Source-implemented.

**Source files:** [Admin/RoleController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/RoleController.php) · [Admin/PermissionController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PermissionController.php) · [Middleware/Clearance.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Middleware/Clearance.php) · [Models/Permission.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Permission.php).

### 08. Identity verification and KYC

**Functionality:** User submits verification requests and document files, can resubmit; admin reviews statuses, notes and approval; verified user flag and document migrations exist.

**Data/contracts:** verification_requests; verification_documents; users.is_verified.

**Implementation status:** Source-implemented.

**Source files:** [Api/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/UserController.php) · [Search/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Search/UserController.php) · [Admin/VerificationController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/VerificationController.php) · [Models/VerificationRequest.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/VerificationRequest.php) · [Models/VerificationDocument.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/VerificationDocument.php).

### 09. Blacklists, bans and user safety

**Functionality:** Administrative blacklist CRUD, banned-user middleware, optional verification gates, anti-spam and per-route request security.

**Data/contracts:** Blacklist; User.

**Implementation status:** Source-implemented.

**Source files:** [Admin/BlacklistController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/BlacklistController.php) · [Middleware/BannedUser.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Middleware/BannedUser.php) · [Models/Blacklist.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Blacklist.php) · [Setting/SecuritySetting.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Setting/SecuritySetting.php).

### 10. Admin impersonation

**Functionality:** Administrators may impersonate other user accounts subject to permission and model checks; impersonation library is included in local packages.

**Data/contracts:** User; role/authorization.

**Implementation status:** Code present; role access needs runtime validation.

**Source files:** [Models/User.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/User.php) · [Admin/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/UserController.php) · [Controllers/ImpersonateController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/packages/lab404/laravel-impersonate/src/Controllers/ImpersonateController.php).

## Main — Listings (9 modules)

### 11. Listing create and update

**Functionality:** Primary posting endpoints, single/multi-step workflows, identity/verification checks, listing content and contact details, publication permissions and form validation.

**Data/contracts:** Post; PostType; PostValue; Picture.

**Implementation status:** Source-implemented.

**Source files:** [Api/PostController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/PostController.php) · [MultiSteps/CreateController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Post/CreateOrEdit/MultiSteps/CreateController.php) · [SingleStep/CreateController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Post/CreateOrEdit/SingleStep/CreateController.php) · [Requests/PostRequest.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Requests/PostRequest.php).

### 12. Listing edit and multi-step wizard

**Functionality:** Edit existing posts using category chooser, wizard steps, photos and packages; API has distinct StoreTrait and update form traits.

**Data/contracts:** Post; Picture; CategoryField.

**Implementation status:** Source-implemented.

**Source files:** [MultiSteps/EditController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Post/CreateOrEdit/MultiSteps/EditController.php) · [MultiSteps/PhotoController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Post/CreateOrEdit/MultiSteps/PhotoController.php) · [CreateOrEdit/StoreTrait.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/Post/CreateOrEdit/StoreTrait.php).

### 13. Listing status, archive, draft and moderation

**Functionality:** Publish/draft/archive/unarchive, admin review, status updates, trash, pending approval and restore/repost functionality. Post query scopes affect visible results.

**Data/contracts:** posts.reviewed; archived_at; status; active.

**Implementation status:** Source-implemented.

**Source files:** [Account/PostsController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/PostsController.php) · [Api/PostController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/PostController.php) · [Admin/PostController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PostController.php) · [Models/Post.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Post.php).

### 14. Listing templates and reposting

**Functionality:** Save an ad as template, request saved templates and republish listings. Check template schema and ownership checks on edit.

**Data/contracts:** Post.is_template; Post.user_id.

**Implementation status:** Source-implemented.

**Source files:** [Api/PostController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/PostController.php) · [Account/PostsController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/PostsController.php) · [Web/HomeController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/HomeController.php).

### 15. Scheduled listing expiry, purge and reminders

**Functionality:** ExpireListings, ListingsPurge and NotifyListingExpiry commands, notifications and post expiration columns. The main Kernel schedule calls for purge/expiry are commented out, so execution cadence is NOT verified.

**Data/contracts:** Post; archived_at; expiration_mail_sent_at.

**Implementation status:** Commands present; automated schedule not enabled in inspected kernel.

**Source files:** [Commands/ExpireListings.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Console/Commands/ExpireListings.php) · [Commands/ListingsPurge.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Console/Commands/ListingsPurge.php) · [Commands/NotifyListingExpiry.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Console/Commands/NotifyListingExpiry.php) · [Console/Kernel.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Console/Kernel.php).

### 16. Post picture gallery and upload

**Functionality:** Image upload, ordering, replacement, deletion, previews and photo URL transformations in web/API traits and Picture model. Supported MIME, size and storage settings affect results.

**Data/contracts:** pictures; media storage.

**Implementation status:** Source-implemented.

**Source files:** [Api/PictureController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/PictureController.php) · [Product/ProductController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Product/ProductController.php) · [Models/Picture.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Picture.php) · [Setting/UploadSetting.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Setting/UploadSetting.php).

### 17. Category hierarchy and taxonomy

**Functionality:** Admin category CRUD, nested-set descendants, root/child paths, category detail, category descriptions and country-localized metadata.
**Data/contracts:** categories; category_field; category descriptions.

**Implementation status:** Source-implemented.

**Source files:** [Admin/CategoryController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/CategoryController.php) · [Admin/CategoriesDescriptionController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/CategoriesDescriptionController.php) · [Models/Category.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Category.php) · [Models/CategoryDescription.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/CategoryDescription.php).

### 18. Dynamic category-specific custom fields

**Functionality:** Create custom fields/options, assign to categories, show input/select data and use fields for search filters. Nested option trees and pivot entries require special care.

**Data/contracts:** fields; fields_options; category_field; post_values.

**Implementation status:** Source-implemented.

**Source files:** [Admin/FieldController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/FieldController.php) · [Admin/CategoryFieldController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/CategoryFieldController.php) · [Models/Field.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Field.php) · [Models/CategoryField.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/CategoryField.php) · [Models/FieldOption.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/FieldOption.php).

### 19. Category and feature-specific listing boosts

**Functionality:** Feature catalog, category_feature mapping, post feature activation, expiration and package feature inheritance, with price and duration.

**Data/contracts:** features; post_features; package_feature; category_feature.

**Implementation status:** Source-implemented.

**Source files:** [Features/ApplyPackageFeaturesToPost.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Features/ApplyPackageFeaturesToPost.php) · [Models/Feature.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Feature.php) · [Models/PostFeature.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/PostFeature.php) · [Models/Package.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Package.php).

## Main — Search (4 modules)

### 20. Global search and advanced filters

**Functionality:** Category/city/tag/user/keyword search, advanced filters, pagination/display modes, category fields and AJAX results.

**Data/contracts:** Post; Category; FieldOption; City.

**Implementation status:** Source-implemented.

**Source files:** [Search/SearchController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Search/SearchController.php) · [Post/SearchTrait.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/Post/SearchTrait.php) · [Search/SearchDropdownController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Search/SearchDropdownController.php).

### 21. Geo search, countries, regions and location picker

**Functionality:** Region/province/city/neighbour dropdowns, location detection, geolocation settings and distance/localized query scopes; user location can persist across requests.

**Data/contracts:** Country; City; SubAdmin1; SubAdmin2; Region.

**Implementation status:** Source-implemented.

**Source files:** [Search/SearchDropdownController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Search/SearchDropdownController.php) · [Location/SelectController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Ajax/Location/SelectController.php) · [Models/Country.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Country.php) · [Models/City.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/City.php).

### 22. Category and location listing pages

**Functionality:** Browse lists by category, tag, user, city or geography with readable SEO URLs; localization and dynamic route prefixes influence final paths.

**Data/contracts:** Post; Category; City.

**Implementation status:** Source-implemented.

**Source files:** [Search/CategoryController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Search/CategoryController.php) · [Search/CityController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Search/CityController.php) · [Search/TagController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Search/TagController.php).

### 23. Listing detail, recommendations and related posts

**Functionality:** Public ad detail, pictures, similar-by-category/location, browser identifiers, visitation and recommended posts; interactions can update counters.

**Data/contracts:** Post; Picture; Browser.

**Implementation status:** Source-implemented.

**Source files:** [Post/ShowController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Post/ShowController.php) · [Post/SimilarByCategory.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Post/SimilarByCategory.php) · [Post/SimilarByLocation.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Post/SimilarByLocation.php) · [Post/LatestOrPremium.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Post/LatestOrPremium.php).

## Main — Engagement (6 modules)

### 24. Saved ads and favorites

**Functionality:** User bookmark list, add/remove saved posts, saved listing gallery/favourite gallery and account saved posts screens.

**Data/contracts:** SavedPost; User; Post.

**Implementation status:** Source-implemented.

**Source files:** [Api/SavedPostController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/SavedPostController.php) · [Models/SavedPost.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/SavedPost.php) · [Account/PostsController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/PostsController.php).

### 25. Saved searches

**Functionality:** Store search criteria and saved filters, view/delete user search records from API/web; dynamic categories and location matching.

**Data/contracts:** SavedSearch; user_id; country_code; query.

**Implementation status:** Source-implemented.

**Source files:** [Api/SavedSearchController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/SavedSearchController.php) · [Account/SavedSearchesController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/SavedSearchesController.php) · [Models/SavedSearch.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/SavedSearch.php).

### 26. Buyer and seller private messaging

**Functionality:** Private threads and messages, unread/important markers, participant lifecycle, attachments and moderation/action routes. Distinct from visitor support chat.

**Data/contracts:** threads; threads_messages; threads_participants.

**Implementation status:** Source-implemented.

**Source files:** [Api/ThreadController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/ThreadController.php) · [Api/ThreadMessageController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/ThreadMessageController.php) · [Account/MessagesController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/MessagesController.php) · [Models/Thread.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Thread.php).

### 27. Listing reporting and contact seller

**Functionality:** Report ad form, report category types, email user and messaging/contact notifications.

**Data/contracts:** ReportType; User; Post.

**Implementation status:** Source-implemented.

**Source files:** [Post/ReportController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Post/ReportController.php) · [Api/ContactController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/ContactController.php) · [Models/ReportType.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/ReportType.php).

### 28. Support chat with live agent assignment

**Functionality:** Guest/customer support conversations, receive/send/resume, server-sent events, agent queue, join/leave, mark-read and closure. Agent roles protect staff panel routes.

**Data/contracts:** support_conversations; support_messages; support_events.

**Implementation status:** Source-implemented.

**Source files:** [Controllers/SupportChatController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/SupportChatController.php) · [Controllers/AgentChatController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/AgentChatController.php) · [Models/SupportConversation.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/SupportConversation.php) · [Models/SupportMessage.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/SupportMessage.php).

### 29. AI first-response support and human escalation

**Functionality:** AI response eligibility, chat history, response generation, confusion/out-of-scope detection and escalation; staff notification job if chats unassigned.

**Data/contracts:** SupportConversation; user.is_ai_agent.

**Implementation status:** Source-implemented; external AI credentials unverified.

**Source files:** [Services/AiSupportAgent.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/AiSupportAgent.php) · [Jobs/NotifyAgentsIfChatUnassigned.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Jobs/NotifyAgentsIfChatUnassigned.php) · [Models/SupportEvent.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/SupportEvent.php).

## Main — AI (2 modules)

### 30. AI-generated listing and product descriptions

**Functionality:** API endpoints generate and optimize description content, with fallback behavior and request-level account allowance, usage caps and cost records.

**Data/contracts:** User; Post; Product; cache/counters.

**Implementation status:** Source-implemented; model/provider configured externally.

**Source files:** [Api/PostController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/PostController.php) · [Api/ProductController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/ProductController.php) · [Services/AiUsageLimiter.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/AiUsageLimiter.php) · [Services/EzeadOpenAi.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/EzeadOpenAi.php).

### 31. Admin AI blog authoring

**Functionality:** Admin generation endpoint to create blog copy; separate BlogController manages create, edit, list and delete.

**Data/contracts:** Blog source integration and CMS content.

**Implementation status:** Source-implemented; persistence backend needs route/file verification.

**Source files:** [Admin/BlogAiController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/BlogAiController.php) · [Admin/BlogController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/BlogController.php) · [Services/EzeadOpenAi.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/EzeadOpenAi.php).

## Main — Billing (8 modules)

### 32. Listing payments and payment-method catalog

**Functionality:** Post/payment forms, checkout callback/results, country-compatible payment methods and admin transaction records. One-time payment plugin source is included.

**Data/contracts:** Payment; PaymentMethod; Package.

**Implementation status:** Source-implemented; gateway live status unverified.

**Source files:** [Web/PaymentController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/PaymentController.php) · [Api/PaymentController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/PaymentController.php) · [Admin/PaymentController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PaymentController.php) · [paypal/Paypal.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/extras/plugins/paypal/Paypal.php).

### 33. Packages and pricing plans

**Functionality:** Admin package setup, free/paid plans, durations, picture limits, country/currency and recurring PackagePrice billing intervals.

**Data/contracts:** packages; package_prices.

**Implementation status:** Source-implemented.

**Source files:** [Admin/PackageController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PackageController.php) · [Models/Package.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Package.php) · [Models/PackagePrice.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/PackagePrice.php).

### 34. PayPal product, plan and webhook configuration

**Functionality:** PayPal API calls create/sync products/plans, activate plans, configure webhook, test settings and store plan revisions. Admin routes include configuration form and request throttling.

**Data/contracts:** package_prices; paypal_plan_revisions.

**Implementation status:** Code present; credentials and provider state unverified.

**Source files:** [Payments/PayPalConfigurationService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Payments/PayPalConfigurationService.php) · [Payments/PayPalPlanService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Payments/PayPalPlanService.php) · [Admin/PayPalConfigurationController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PayPalConfigurationController.php) · [config/subscriptions.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/config/subscriptions.php).

### 35. Recurring subscriptions and free-plan activation

**Functionality:** User package purchase, start PayPal subscription, activate free package, plan status transitions and cancellation.

**Data/contracts:** subscriptions; users; payments.
**Implementation status:** Source-implemented; external subscription acceptance unverified.

**Source files:** [Web/UserPaymentController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/UserPaymentController.php) · [Subscriptions/SubscriptionService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Subscriptions/SubscriptionService.php) · [Models/Subscription.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Subscription.php).

### 36. Renewals, pending upgrades and billing failures

**Functionality:** Schedule upgrade to next billing cycle, apply upgrade after payment, process paid sales/failures, suspend/cancel/expire and grace/retry states.

**Data/contracts:** subscriptions; package_prices; payments.

**Implementation status:** Source-implemented.

**Source files:** [Subscriptions/SubscriptionUpgradeService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Subscriptions/SubscriptionUpgradeService.php) · [Subscriptions/SubscriptionPaymentService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Subscriptions/SubscriptionPaymentService.php) · [Subscriptions/SubscriptionService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Subscriptions/SubscriptionService.php).

### 37. PayPal webhook inbox, retries and audit trail

**Functionality:** Persist provider events, claim/deduplicate and queue processing; record old/new subscription states and notification status, with retry/failure handling.

**Data/contracts:** paypal_webhook_events; subscription_audits; subscription_notification_logs.

**Implementation status:** Source-implemented; webhook delivery unverified.

**Source files:** [Api/PayPalWebhookController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/PayPalWebhookController.php) · [Jobs/ProcessPayPalWebhook.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Jobs/ProcessPayPalWebhook.php) · [Models/PayPalWebhookEvent.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/PayPalWebhookEvent.php) · [Subscriptions/SubscriptionAuditService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/Subscriptions/SubscriptionAuditService.php).

### 38. Subscription lifecycle notifications

**Functionality:** Activation, renewal, upcoming renewal, failure, suspension, expiration, cancellation, scheduled/applied upgrades with delivery/deduplication logs.

**Data/contracts:** subscription_notification_logs; subscriptions.

**Implementation status:** Source-implemented.

**Source files:** [Notifications/SubscriptionActivated.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/SubscriptionActivated.php) · [Notifications/SubscriptionRenewed.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/SubscriptionRenewed.php) · [Notifications/SubscriptionPaymentFailed.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/SubscriptionPaymentFailed.php) · [Models/SubscriptionNotificationLog.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/SubscriptionNotificationLog.php).

### 39. Admin payment and checkout records

**Functionality:** Admin screens manage payments, packages and payment methods; Web account transactions shows user history.

**Data/contracts:** payments; payment_methods; packages.

**Implementation status:** Source-implemented.

**Source files:** [Admin/PaymentController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PaymentController.php) · [Admin/PaymentMethodController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PaymentMethodController.php) · [Account/TransactionsController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Account/TransactionsController.php).

## Main — Users and stores (3 modules)

### 40. Public profiles and seller stores

**Functionality:** Profile routes, seller listing galleries, store landing/about/contact/services/testimonial/FAQ, user page editing and profile verification.

**Data/contracts:** User; UserPage; PageType.

**Implementation status:** Source-implemented.

**Source files:** [Search/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Search/UserController.php) · [Web/StoreController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/StoreController.php) · [Api/StoreController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/StoreController.php) · [Models/UserPage.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/UserPage.php).

### 41. Products inside primary classifieds app

**Functionality:** Product CRUD, images/ordering, status, featured toggle and AI-generated description, alongside user store content.

**Data/contracts:** products; User; Category.

**Implementation status:** Source-implemented; distinct from public/core product catalog.

**Source files:** [Product/ProductController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Product/ProductController.php) · [Api/ProductController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/ProductController.php) · [Models/Product.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Product.php).

### 42. Cross-site vertical listing adapters

**Functionality:** Auction, autos, home, rentals, work and shop listing models reference bid_ads, listings, properties, bravo_hotels, jobs_posts and ec_products with media/domain link helpers.

**Data/contracts:** External/shared vertical tables.

**Implementation status:** Adapter models present; system integration unverified.

**Source files:** [Models/AuctionChildePosts.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/AuctionChildePosts.php) · [Models/AutosChildePosts.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/AutosChildePosts.php) · [Models/HomeChildePosts.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/HomeChildePosts.php) · [Models/RentChildePosts.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/RentChildePosts.php) · [Models/ShopChildePosts.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/ShopChildePosts.php) · [Models/WorkChildePosts.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/WorkChildePosts.php).

## Main — Marketing (9 modules)

### 43. Modular homepage and hero sections

**Functionality:** Home sections, latest/sponsored categories, location selectors, stats, advertising blocks, alternate homepage variants and user theme choices.

**Data/contracts:** HomeSection; Post; Advertising.

**Implementation status:** Source-implemented.

**Source files:** [Web/HomeController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/HomeController.php) · [Models/HomeSection.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/HomeSection.php) · [Admin/HomeSectionController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/HomeSectionController.php).

### 44. Advertising slots and banner placements

**Functionality:** Admin advertising CRUD, configured slot tracking codes, active state and responsive variants; public home-page top/bottom ad components.

**Data/contracts:** advertising; home_sections.

**Implementation status:** Code present; actual ad-provider delivery unverified.

**Source files:** [Admin/AdvertisingController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/AdvertisingController.php) · [Models/Advertising.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Advertising.php) · [HomeSection/GetTopAdvertising.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/HomeSection/GetTopAdvertising.php) · [HomeSection/GetBottomAdvertising.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/HomeSection/GetBottomAdvertising.php).

### 45. Promo cards and featured listings

**Functionality:** Admin add/edit/delete promotional cards with image, text and button, promoted listing status and homepage promotion interfaces.

**Data/contracts:** promo_cards; posts.featured/showcase.

**Implementation status:** Source-implemented.

**Source files:** [Admin/PromoCardsController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PromoCardsController.php) · [Models/PromoCards.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/PromoCards.php) · [Web/HomeController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/HomeController.php).

### 46. Newsletters and subscribers

**Functionality:** Public subscription endpoints, email list model and admin/newsletter mailing integrations or forms.

**Data/contracts:** newsletters.

**Implementation status:** Source-implemented; email sending configuration unverified.

**Source files:** [Api/NewsletterController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/NewsletterController.php) · [Web/FrontController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/FrontController.php) · [Models/Newsletter.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Newsletter.php).

### 47. Contact forms and notifications

**Functionality:** Contact requests, post report notifications, captcha requests and administrator/customer mail notifications.

**Data/contracts:** Mail; ContactRequest; User.

**Implementation status:** Source-implemented.

**Source files:** [Web/PageController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/PageController.php) · [Api/ContactController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/ContactController.php) · [Notifications/FormSent.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/FormSent.php).

### 48. Blog pages and WordPress helper integration

**Functionality:** Admin blog CRUD, blog categories and single blog routes, SEO/meta and a WordPress helper. Do not assume all blog data is in the main database.

**Data/contracts:** Blog content source not resolved from model alone.

**Implementation status:** Code present; linked CMS data unverified.

**Source files:** [Admin/BlogController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/BlogController.php) · [Search/SearchController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Search/SearchController.php) · [Functions/wordpress.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Helpers/Functions/wordpress.php).

### 49. SEO, sitemap and dynamic metadata

**Functionality:** Canonical, Open Graph, structured metadata, per-country sitemaps, categories/cities/posts/blog sitemaps, dynamic URL slugs, SEO configuration.

**Data/contracts:** MetaTag; Page; Country; Post.

**Implementation status:** Source-implemented.

**Source files:** [Web/SitemapsController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/SitemapsController.php) · [Web/SitemapController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/SitemapController.php) · [Models/MetaTag.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/MetaTag.php) · [Setting/SeoSetting.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Setting/SeoSetting.php).

### 50. CMS pages and privacy compliance

**Functionality:** CMS pages and marketing copy, public privacy-policy override with Facebook Login disclosure and data-deletion instructions; footer navigation pages.

**Data/contracts:** pages; SEO.

**Implementation status:** Source-implemented; policy legal verification outstanding per repo doc.

**Source files:** [Web/PageController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/PageController.php) · [Models/Page.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Page.php) · [docs/privacy-policy-meta-compliance.md](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/docs/privacy-policy-meta-compliance.md).

### 51. Reviews and ratings plugin

**Functionality:** Locally included reviews plugin with web/API/admin controllers, rating resources, SQL installer and templates; listing/user rating integrations.

**Data/contracts:** review plugin schema.

**Implementation status:** Plugin source present; installed/enabled state unverified.

**Source files:** [reviews/Reviews.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/extras/plugins/reviews/Reviews.php) · [Api/ReviewController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/extras/plugins/reviews/app/Http/Controllers/Api/ReviewController.php) · [Models/Review.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/extras/plugins/reviews/app/Models/Review.php) · [Post/ReviewsPlugin.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Post/ReviewsPlugin.php).

## Main — Administration (9 modules)

### 52. Admin dashboard, KPIs and charts

**Functionality:** Admin dashboard page, posts/users/country distribution charts, listing/user stats and recent activity panels.

**Data/contracts:** User; Post; Payment.

**Implementation status:** Source-implemented.

**Source files:** [Admin/DashboardController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/DashboardController.php) · [Charts/ChartjsTrait.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/Traits/Charts/ChartjsTrait.php) · [Charts/MorrisTrait.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/Traits/Charts/MorrisTrait.php).

### 53. Back-office CRUD management

**Functionality:** Generated Panel CRUD for users, categories, custom fields, posts, photos, languages, ads, pages, payments, packages, settings, roles/permissions and verification.

**Data/contracts:** Most primary Eloquent models.

**Implementation status:** Source-implemented.

**Source files:** [Library/Panel.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/Panel/Library/Panel.php) · [Admin/PostController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/PostController.php) · [Admin/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/UserController.php) · [web/admin.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/routes/web/admin.php).
### 54. General settings and customization

**Functionality:** Typed app/settings screens for mail, SMS, security/captcha, lists/search, geolocation, SEO, styles/theme, uploads, backups and optimization.

**Data/contracts:** settings.

**Implementation status:** Source-implemented.

**Source files:** [Admin/SettingController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/SettingController.php) · [Models/Setting.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Setting.php) · [Setting/AppSetting.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Setting/AppSetting.php) · [Setting/StyleSetting.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Setting/StyleSetting.php).

### 55. Languages, currencies and localization

**Functionality:** Admin editable locales, country settings, exchange rate/currency data, translated naming/fields, language sync and file edits.

**Data/contracts:** languages; currencies; country configuration.

**Implementation status:** Source-implemented.

**Source files:** [Admin/LanguageController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/LanguageController.php) · [Admin/CurrencyController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/CurrencyController.php) · [Models/Language.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Language.php) · [Models/Currency.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Models/Currency.php).

### 56. Backup, maintenance and upgrade

**Functionality:** Admin backup create/download/delete, cache clear, thumbnail regeneration, maintenance mode, first-time installer and upgrade wizard. Main console scheduling config is commented out.

**Data/contracts:** Backup settings; migrations; upgrade scripts.

**Implementation status:** Operations code present; scheduler not confirmed.

**Source files:** [Admin/BackupController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/BackupController.php) · [Admin/ActionController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/ActionController.php) · [Install/InstallController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Install/InstallController.php) · [Install/UpdateController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/Install/UpdateController.php).

### 57. System diagnostics and API documentation

**Functionality:** System information, configuration diagnostics, Scribe documentation and API response resource objects; debug endpoints require security review.

**Data/contracts:** App settings; logs; API resources.

**Implementation status:** Code present; some diagnostics may need protection.

**Source files:** [Admin/SystemController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Admin/SystemController.php) · [Api/BaseController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Api/BaseController.php) · [config/scribe.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/config/scribe.php) · [routes/web.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/routes/web.php).

### 58. Push messages and notification delivery

**Functionality:** Firebase Cloud Messaging, device token storage, post updates, payment/verification and subscription notices over mail/SMS/push channels.

**Data/contracts:** users.fcm_token; notifications.

**Implementation status:** Source-implemented; provider credentials/delivery unverified.

**Source files:** [Services/FirebaseService.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Services/FirebaseService.php) · [Web/HomeController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Http/Controllers/Web/HomeController.php) · [Notifications/UserNotification.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/UserNotification.php) · [Notifications/PaymentApproved.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Notifications/PaymentApproved.php).

### 59. Queues, jobs and console tasks

**Functionality:** Jobs for PayPal webhooks, search indexing and unassigned chat notifications; artisan commands for expiry, purge, provider plans and reminders. Check queue driver/workers/actual cron separately.

**Data/contracts:** jobs; failed_jobs; Post; Subscription.

**Implementation status:** Source present; activation/worker schedule unverified.

**Source files:** [Jobs/ProcessPayPalWebhook.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Jobs/ProcessPayPalWebhook.php) · [Jobs/IndexAdOnGoogle.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Jobs/IndexAdOnGoogle.php) · [Commands/ProvisionPayPalSubscriptionPlans.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Console/Commands/ProvisionPayPalSubscriptionPlans.php) · [Console/Kernel.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/app/Console/Kernel.php).

### 60. Browser JavaScript forms, messaging and maps

**Functionality:** First-party JS under public/assets/js/app for browse location/category modals, favorite toggling, messenger UI, phone display, plus ezead photo/map/location helpers. Components also exist as Blade inline scripts.

**Data/contracts:** UI view state; API routes.

**Implementation status:** Source present; active bundling/page coverage unverified.

**Source files:** [app/messenger.js](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/assets/js/app/messenger.js) · [app/make.favorite.js](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/assets/js/app/make.favorite.js) · [js/ezead-map.js](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/assets/js/ezead-map.js) · [js/ezead-photo-http.js](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/assets/js/ezead-photo-http.js).

## Core storefront — Catalog (7 modules)

### 61. Storefront catalog and product detail

**Functionality:** Separate Laravel 8 home/category/brand/product browse, filters, search/detail, quick view, pagination, order tracking and CMS pages.

**Data/contracts:** Secondary Product; Category; SubCategory; Brand.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/SiteController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/SiteController.php) · [Models/Product.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Product.php) · [Models/Category.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Category.php) · [Models/Brand.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Brand.php).

### 62. Product and brand administration

**Functionality:** Admin product create/update, brand and category/subcategory CRUD, product images and digital assets, today deals and discount controls.

**Data/contracts:** Secondary products; brand; category.

**Implementation status:** Source-implemented in second app.

**Source files:** [Admin/ProductController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/ProductController.php) · [Admin/BrandController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/BrandController.php) · [Admin/SubCategoryController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/SubCategoryController.php).

### 63. Shopping cart

**Functionality:** Add, update quantity, delete, cart count, calculate cart lines and coupon application prior to checkout.

**Data/contracts:** Secondary Cart; Product; Coupon.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/CartController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/CartController.php) · [Models/Cart.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Cart.php) · [Controllers/CheckoutController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/CheckoutController.php).

### 64. Coupons and offers

**Functionality:** Coupon create/admin, user coupon application, storefront promotional pricing and today's deals.

**Data/contracts:** Secondary Coupon; Product.

**Implementation status:** Source-implemented in second app.

**Source files:** [Admin/CouponController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/CouponController.php) · [Controllers/CartController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/CartController.php) · [Models/Coupon.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Coupon.php).

### 65. Checkout and shipping methods

**Functionality:** Select shipping options, calculate sub totals, create an order, manage delivery prices and administration shipping options.

**Data/contracts:** Secondary Order; OrderDetail; ShippingMethod.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/CheckoutController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/CheckoutController.php) · [Admin/ShippingMethodController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/ShippingMethodController.php) · [Models/ShippingMethod.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/ShippingMethod.php).

### 66. Order history, status, invoice and tracking

**Functionality:** Customer order history, order details, downloadable files, order tracking; admin order management and invoice templates.

**Data/contracts:** Secondary Order; OrderDetail.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/OrderController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/OrderController.php) · [Admin/ManageOrderController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/ManageOrderController.php) · [Models/Order.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Order.php).

### 67. Wishlists and reviews

**Functionality:** Wishlist add/remove, product ratings/reviews, admin review moderation and customer reviews.

**Data/contracts:** Secondary Wishlist; Review; Product.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/WishlistController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/WishlistController.php) · [Controllers/ReviewProductController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/ReviewProductController.php) · [Models/Review.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Review.php).

## Core storefront — Identity (2 modules)

### 68. Store customer authentication and 2FA

**Functionality:** Distinct customer/admin login/registration/recovery flows, email/SMS verify and Google authenticator 2FA checks.

**Data/contracts:** Secondary User; Admin; login tokens.

**Implementation status:** Source-implemented in second app.

**Source files:** [Auth/LoginController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Auth/LoginController.php) · [Controllers/AuthorizationController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/AuthorizationController.php) · [Lib/GoogleAuthenticator.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Lib/GoogleAuthenticator.php).

### 69. Customer profile and wallet area

**Functionality:** Profile, password, user dashboard, balance and transaction history, deposit/payment history and account authorization.

**Data/contracts:** Secondary User; Transaction; Deposit.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/UserController.php) · [Admin/ManageUsersController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/ManageUsersController.php) · [Models/Transaction.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Transaction.php).

## Core storefront — Finance (4 modules)

### 70. Deposits and manual payments

**Functionality:** Wallet top-ups/deposit methods, gateway selection, preview/confirmation and manual deposits; admin manages pending/approved deposits.

**Data/contracts:** Secondary Deposit; Gateway; GatewayCurrency.

**Implementation status:** Source-implemented in second app.

**Source files:** [Gateway/PaymentController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Gateway/PaymentController.php) · [Admin/DepositController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/DepositController.php) · [Models/Deposit.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Deposit.php).

### 71. Withdrawals and payout methods

**Functionality:** Customer withdrawal request, preview/submit, method listing and history; admin config, approve/reject and audit routes.

**Data/contracts:** Secondary Withdrawal; WithdrawMethod; User.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/UserController.php) · [Admin/WithdrawalController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/WithdrawalController.php) · [Models/Withdrawal.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/Withdrawal.php).

### 72. Stripe card gateway variants

**Functionality:** Gateway/Stripe, StripeJs and StripeV3 process and IPN handlers exist; stripe/stripe-php dependency is declared by the secondary composer manifest.
**Data/contracts:** Secondary Gateway and Deposit.

**Implementation status:** Code present in public/core ONLY; live credentials/configuration unverified.

**Source files:** [Stripe/ProcessController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Gateway/Stripe/ProcessController.php) · [StripeJs/ProcessController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Gateway/StripeJs/ProcessController.php) · [StripeV3/ProcessController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Gateway/StripeV3/ProcessController.php) · [core/composer.json](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/composer.json).

### 73. PayPal and other payment gateways

**Functionality:** Independent gateway adapter handlers for PayPal SDK, Paytm, Paystack, Razorpay, Coinbase/CoinGate, Mollie, Flutterwave, Skrill, crypto etc with IPN routes. Multiple registered endpoints, not proof all enabled.

**Data/contracts:** Secondary Gateway; Deposit; Transaction.

**Implementation status:** Gateway code present; production providers unverified.

**Source files:** [Paypal/ProcessController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Gateway/Paypal/ProcessController.php) · [PaypalSdk/ProcessController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Gateway/PaypalSdk/ProcessController.php) · [Razorpay/ProcessController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Gateway/Razorpay/ProcessController.php) · [routes/web.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/routes/web.php).

## Core storefront — Engagement (1 modules)

### 74. Support tickets and attachments

**Functionality:** Customers create, view and reply to support tickets; attachments/download, staff/admin ticket routing and notification workflows.

**Data/contracts:** Secondary SupportTicket; SupportMessage; SupportAttachment.

**Implementation status:** Source-implemented in second app.

**Source files:** [Controllers/TicketController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/TicketController.php) · [Admin/SupportTicketController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/SupportTicketController.php) · [Models/SupportTicket.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Models/SupportTicket.php).

## Core storefront — Content (5 modules)

### 75. Pages and CMS page builder

**Functionality:** Admin content-builder, home/frontend sections, templates, SEO, general settings and public informational pages.

**Data/contracts:** Secondary Page; Frontend; GeneralSetting.

**Implementation status:** Source-implemented in second app.

**Source files:** [Admin/PageBuilderController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/PageBuilderController.php) · [Admin/FrontendController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/FrontendController.php) · [Controllers/SiteController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/SiteController.php).

### 76. Newsletters, contact and messaging templates

**Functionality:** Subscriber capture/admin mail campaigns and email/SMS template configuration for the storefront.

**Data/contracts:** Secondary Subscriber; EmailTemplate; SmsTemplate.

**Implementation status:** Source-implemented in second app.

**Source files:** [Admin/SubscriberController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/SubscriberController.php) · [Admin/EmailTemplateController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/EmailTemplateController.php) · [Admin/SmsTemplateController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/SmsTemplateController.php).

### 77. Admin analytics, audit and reporting

**Functionality:** Admin dashboard, customers/logins, deposits/withdrawals, support, transactions, order reports and delivery/payment summaries.

**Data/contracts:** Secondary UserLogin; Transaction; Orders.

**Implementation status:** Source-implemented in second app.

**Source files:** [Admin/AdminController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/AdminController.php) · [Admin/ReportController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/ReportController.php) · [Admin/ManageUsersController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/ManageUsersController.php).

### 78. REST API for customer and wallet

**Functionality:** Own API auth/register/login/recovery, user profile/password, verification, deposit/withdrawal/transaction endpoints. It is independent of the main Laravel 9 API.

**Data/contracts:** Secondary API User and Deposit.

**Implementation status:** Source-implemented in second app.

**Source files:** [routes/api.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/routes/api.php) · [Api/UserController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Api/UserController.php) · [Api/PaymentController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Api/PaymentController.php).

### 79. Extension, language and theme operations

**Functionality:** Admin customizations, extensions, language records, frontend theme assets and site options.

**Data/contracts:** Secondary Extension; Language; GeneralSetting.

**Implementation status:** Source-implemented in second app.

**Source files:** [Admin/ExtensionController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/ExtensionController.php) · [Admin/LanguageController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/LanguageController.php) · [Admin/GeneralSettingController.php](https://github.com/ashiq/ezead-1/blob/39e700d3faa33f2b5eddd5ad80dfc15b34ab7eb1/public/core/app/Http/Controllers/Admin/GeneralSettingController.php).

## Unverified / excluded (3 modules)

### 80. Human resources management

**Functionality:** No HR employee records, job grades, leave policies, HR workflow routes or HR-specific controllers were verified. The Jobs_user and jobs_posts listing adapter names are not equivalent to employee HR management.

**Data/contracts:** No primary HR system identified.

**Implementation status:** Not found in inspected business modules; cannot certify absent from external systems.

**Source files:** None established; not implemented as a confirmed module.

### 81. Payroll processing

**Functionality:** No native salaries, payroll runs, tax withholding, payslips or wage disbursement subsystem was verified. Secondary wallet withdrawals are not employee payroll.

**Data/contracts:** No payroll schema or controller identified.

**Implementation status:** Not found in inspected business modules.

**Source files:** None established; not implemented as a confirmed module.

### 82. Active payment service status

**Functionality:** Stripe is implemented in the secondary app source, while primary PayPal integration is confirmed in source. Merchant activation, production keys, success rates, payment settlements and which app is deployed remain unknown.

**Data/contracts:** Provider configuration and production telemetry unavailable.

**Implementation status:** Unverified externally.

**Source files:** None established; not implemented as a confirmed module.

## User-requested capability matrix

| Business capability | Primary classifieds app | Secondary public/core store | Certainty |
|---|---|---|---|
| Email/password authentication | Yes, controller/auth routes | Yes | Source present |
| Google/Facebook/social auth | Provider callback code | Not established by this audit | Configuration and active routes unverified |
| User management | Yes | Yes | Source present |
| Role-based access/admin panel | Yes, Spatie and admin panel | Separate admin/customer system | Source present |
| KYC / user verification | Yes | User verification/2FA code | Source present |
| Classified postings + custom categories | Yes | Separate product catalog | Source present |
| Categories, taxonomy and custom fields | Yes | Category/brand/subcategory | Source present |
| Advanced search and geolocation | Yes | Store product/catalog search | Source present |
| Buyer/seller messaging | Yes, thread-based | Tickets/support | Source present |
| Human live support with AI handoff | Yes | Support tickets (different system) | Source present |
| AI-generated descriptions/blog content | Yes | Not confirmed | Source present in main |
| PayPal subscriptions and listing boost packages | Yes | Has distinct PayPal gateway | Source present; live billing unverified |
| Stripe payments | Not confirmed as a primary-app payment integration | Stripe, StripeJS, StripeV3 handlers | Source present in secondary only |
| Shopping cart/checkout | Not confirmed in primary classifier | Yes | Source present in secondary |
| Coupons, shipping and orders | Not confirmed in primary classifier | Yes | Source present in secondary |
| Product/store management | Yes, basic user products/store | Yes, fuller commerce catalog | Source present |
| Deposits and withdrawals | Not confirmed as primary checkout subsystem | Yes, wallet/account finance | Source present in secondary |
| Blog/CMS and SEO | Yes | CMS and page builder | Source present |
| Advertising and promotional cards | Yes | Sale and catalog promotions | Source present |
| Email, SMS, push notifications | Email/SMS/FCM code | Email/SMS gateway/template code | Delivery unverified |
| HR management | No reliable evidence | No reliable evidence | Not verified |
| Payroll | No reliable evidence | No reliable evidence | Not verified |

## Suggested review and verification for acceptance
1. Compare module claims with your production environment: which host exposes main app vs public/core, and which features are actually enabled.
2. Confirm payments: one-time PayPal plugin vs recurring PayPal subscriptions, public/core PayPal/Stripe processors, merchant status and webhook health.
3. Verify data sources for auction/autos/homes/rent/jobs/shop child adapters and WordPress/blog storage.
4. Confirm live support roles, escalation rules, AI access and actual Firebase provider configuration.
5. Check customer account deletion, identity verification, subscription invoices and notifications against expected compliance.
6. Inspect schedule deployment: main app/Console/Kernel.php currently comments out routine listing expiry, purge and backup schedule entries.
7. Check security of tracked environment save file and public debug/clear endpoints; no secret material was reproduced.
8. Review this alongside the exhaustive custom file/route inventory in PROJECT_CONTEXT.md; mark any business workflows needing manual runtime acceptance. No automatic test suite or production observation was performed.

## Scope note
The companion AI context lists every tracked matching application-source file from the whole non-truncated repository tree, including primary PHP/Blade/config/migrations, local plugins, JS, the secondary storefront app, admin/API files and route declarations. This business inventory groups application functionality into readable modules. It does **not** imply every file was semantically evaluated or 100% of runtime behavior tested. When an AI makes code changes, it should use the context and inspect the exact source callsites at the current commit.