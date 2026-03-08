# NetPro — Technical Specification

## Overview

NetPro is a decentralized professional networking hub on the Internet Computer. Users authenticate via Internet Identity, create rich professional profiles, connect with peers, message connections (with file attachments), browse and post job listings, and participate in industry group discussions.

## Architecture

- **Backend:** Single Motoko actor (`main.mo`) using `mo:core` Map for all persistent state, with `MixinStorage()` for blob storage (avatars, resumes, message attachments)
- **Frontend:** React + TypeScript, TanStack Query, shadcn/ui components, Tailwind CSS
- **Auth:** Internet Identity via `@dfinity/auth-client`
- **File Storage:** ExternalBlob via Caffeine blob-storage (`blob-storage/Storage`, `blob-storage/Mixin`), accessed on the frontend through `StorageClient`

## Data Model

### Profile

- `name`, `headline`, `location`, `industry`, `bio` — text fields
- `skills` — array of skill strings
- `workHistory` — array of `WorkEntry` (company, title, startYear, endYear, description)
- `education` — array of `EducationEntry` (school, degree, field, year)
- `avatar` — `?Storage.ExternalBlob` (uploaded via blob storage)
- `resume` — `?Storage.ExternalBlob` (uploaded via blob storage)
- `createdAt` — nanosecond timestamp
- `profileVisibility` — `#Public | #ConnectionsOnly`

### UserSummary

Lightweight user reference used in search results and suggestions:

- `principal`, `name`, `headline`, `avatar` (`?Storage.ExternalBlob`)

### Endorsements

- `Endorsement` — skill, endorserPrincipal, createdAt
- Stored per user as an array; connections can endorse each other's skills

### Connections

- `ConnRequest` — id, from, to, status (`#Pending | #Accepted | #Declined`), createdAt
- Bidirectional connection set per user
- Duplicate pending request prevention

### Messages

- `Message` — id, from, to, body, attachment (`?Storage.ExternalBlob`), attachmentName (`?Text`), createdAt, read
- `ConversationPreview` — partner, lastMessage, lastMessageAt, unreadCount
- Indexed per conversation thread; requires active connection to message

### Jobs

- `JobPosting` — id, posterPrincipal, title, company, description, requirements, salaryRange, location, industry, experienceLevel, createdAt, active
- `JobApplication` — id, jobId, applicantPrincipal, coverLetter, resume (`?Storage.ExternalBlob`), createdAt, status (`#Applied | #Accepted | #Rejected`)
- `ApplicationStatus` — variant `#Applied | #Accepted | #Rejected`; job poster can update status

### Groups & Posts

- `Group` — id, name, description, industry, creatorPrincipal, createdAt, memberCount
- `GroupPost` — id, groupId, authorPrincipal, body, postType (`#Article | #Question | #Insight`), createdAt, likeCount
- `PostComment` — id, postId, authorPrincipal, body, createdAt
- Group creator cannot leave their group

### Notifications

- `Notification` — id, recipientPrincipal, kind, referenceId, message, read, createdAt
- `NotifKind` — `#ConnectionRequest | #ConnectionAccepted | #NewMessage | #PostLiked | #PostCommented | #JobApplicationReceived | #GroupPostCreated | #SkillEndorsed`

## Backend Endpoints

### Profile

- `setProfile(name, headline, location, industry, bio, skills, workHistory, education)` — create/update profile (preserves existing avatar, resume, visibility)
- `getProfile()` — own profile
- `getPublicProfile(target)` — another user's profile (respects visibility + block)
- `setAvatar(avatar: ?ExternalBlob)` — update avatar blob
- `setResume(resume: ?ExternalBlob)` — update resume blob
- `addEndorsement(target, skill)` — endorse a connection's skill
- `getEndorsements(target)` — list endorsements for a user
- `searchUsers(query)` — search users by name/headline (max 20 results)

### Connections

- `sendConnectionRequest(to)` — send a request (prevents duplicates)
- `respondToRequest(requestId, accept)` — accept or decline
- `getConnectionRequests()` — pending incoming requests
- `getSentRequests()` — pending outgoing requests
- `getConnections()` — list of connected principals
- `getConnectionSuggestions()` — users with overlapping skills, location, or industry (max 10)
- `removeConnection(other)` — disconnect

### Messaging

- `sendMessage(to, body, attachment, attachmentName)` — send to a connection (supports file attachments)
- `getConversations()` — list conversation previews with unread counts
- `getMessages(partner)` — thread with one user (sorted ascending by time)
- `markMessagesRead(partner)` — mark as read
- `getUnreadCount()` — total unread messages

### Jobs

- `createJob(title, company, description, requirements, salaryRange, location, industry, experienceLevel)` — post a job
- `updateJob(id, ...)` — edit own job
- `deactivateJob(id)` — close a listing
- `getMyJobs()` — own job postings
- `searchJobs(keyword, location, industry, experienceLevel)` — filtered search (active jobs only)
- `getJob(id)` — single job
- `applyToJob(jobId, coverLetter, resume)` — submit application with optional resume blob (prevents duplicate applications)
- `getApplicationsForJob(jobId)` — recruiter view of applicants
- `getMyApplications()` — own submitted applications
- `updateApplicationStatus(applicationId, status)` — job poster accepts/rejects applicants

### Groups

- `createGroup(name, description, industry)` — new group (creator auto-joins)
- `joinGroup(groupId)` / `leaveGroup(groupId)` — membership
- `getGroups()` — all groups
- `getMyGroups()` — joined groups
- `createPost(groupId, body, postType)` — post in a group (notifies members)
- `getGroupPosts(groupId)` — posts in a group (newest first)
- `addComment(postId, body)` — comment on a post
- `getComments(postId)` — comments for a post (oldest first)
- `toggleLike(postId)` — like/unlike
- `deletePost(postId)` — delete own post or moderator delete (group creator)
- `getFeedPosts(limit)` — recent posts from all joined groups

### Notifications

- `getNotifications()` — all notifications (newest first)
- `markNotificationsRead()` — mark all as read
- `getUnreadNotificationsCount()` — unread count

### Privacy & Safety

- `updatePrivacySettings(visibility)` — set profile visibility
- `blockUser(target)` / `unblockUser(target)` — block management (also removes connection)
- `getBlockedUsers()` — list of blocked principals

## Frontend Pages

| Page              | Route (state)   | Description                                                |
| ----------------- | --------------- | ---------------------------------------------------------- |
| LandingPage       | unauthenticated | Hero, features, login CTA                                  |
| FeedPage          | `feed`          | Posts from joined groups, post composer                    |
| ProfilePage       | `profile`       | Own profile with all sections, avatar upload               |
| PublicProfilePage | `publicProfile` | Another user's profile, endorse/connect actions            |
| NetworkPage       | `network`       | Connections, requests, sent requests, suggestions          |
| MessagesPage      | `messages`      | Conversation list + thread with attachments                |
| JobsPage          | `jobs`          | Browse, My Postings, My Applications, applicant management |
| GroupsPage        | `groups`        | Browse groups, My Groups                                   |
| GroupFeedPage     | `group`         | Group detail + post feed                                   |
| NotificationsPage | `notifications` | Notification list                                          |
| SettingsPage      | `settings`      | Privacy, blocked users                                     |

## Frontend Components

| Component              | Description                                       |
| ---------------------- | ------------------------------------------------- |
| Header                 | Top bar with nav, unread badges, user avatar      |
| Sidebar                | Desktop left sidebar navigation                   |
| BottomNav              | Mobile bottom navigation with unread badges       |
| ThreeColumnLayout      | Responsive layout wrapper                         |
| ProfileSetupDialog     | First-time profile creation modal                 |
| ProfileEditDialog      | Edit existing profile fields                      |
| UserDisplay            | Reusable user name/avatar display                 |
| ConnectionCard         | Connection entry with message/remove actions      |
| PendingRequestsSection | Incoming connection requests                      |
| SentRequestCard        | Outgoing request with status                      |
| SuggestionsSection     | Connection suggestions based on shared attributes |
| ConversationList       | Message inbox with conversation previews          |
| MessageThread          | Chat thread with file attachment support          |
| PostCard               | Group post with likes, comments, author info      |
| CommentsSection        | Comment list and composer for a post              |
| NewPostDialog          | Create new group post                             |
| GroupCard              | Group list item with join/leave                   |
| JobCard                | Job listing card                                  |
| JobSearchBar           | Search/filter bar for job listings                |
| PostJobDialog          | Create/edit job posting                           |
| ApplyDialog            | Job application form with resume upload           |
| ApplicationCard        | Own application status display                    |
| ApplicantCard          | Applicant card for job poster with accept/reject  |
| JobApplicantsSection   | List of applicants for a job posting              |
| SkillsSection          | Skills display with endorsements                  |
| WorkHistorySection     | Work experience display                           |
| EducationSection       | Education display                                 |
| PrivacySettingsSection | Privacy toggle controls                           |
| BlockedUsersSection    | Blocked user management                           |

## Frontend Stack

- React 18 + TypeScript
- TanStack Query v5 for all data fetching and mutations
- shadcn/ui components
- Tailwind CSS with CSS variable-based theme
- date-fns for date formatting
- sonner for toast notifications
- lucide-react for icons
- Caffeine StorageClient for ExternalBlob file uploads/downloads

## Frontend Utilities

| File                     | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `useActor.ts`            | Actor/canister connection hook                     |
| `useInternetIdentity.ts` | Auth hook for Internet Identity                    |
| `useQueries.ts`          | All TanStack Query hooks (single file)             |
| `StorageClient.ts`       | Blob storage upload/download helpers               |
| `constants.ts`           | App-wide constants (industries, experience levels) |
| `formatting.ts`          | Date/number formatting utilities                   |
| `config.ts`              | App configuration                                  |
