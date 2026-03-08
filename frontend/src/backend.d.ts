import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface WorkEntry {
    startYear: string;
    title: string;
    endYear: string;
    description: string;
    company: string;
}
export interface JobApplication {
    id: bigint;
    status: ApplicationStatus;
    resume?: ExternalBlob;
    applicantPrincipal: Principal;
    createdAt: bigint;
    jobId: bigint;
    coverLetter: string;
}
export interface JobPosting {
    id: bigint;
    experienceLevel: string;
    title: string;
    active: boolean;
    createdAt: bigint;
    description: string;
    company: string;
    salaryRange: string;
    requirements: string;
    posterPrincipal: Principal;
    location: string;
    industry: string;
}
export interface Profile {
    bio: string;
    resume?: ExternalBlob;
    profileVisibility: ProfileVisibility;
    headline: string;
    name: string;
    createdAt: bigint;
    education: Array<EducationEntry>;
    workHistory: Array<WorkEntry>;
    skills: Array<string>;
    location: string;
    industry: string;
    avatar?: ExternalBlob;
}
export interface Group {
    id: bigint;
    name: string;
    createdAt: bigint;
    memberCount: bigint;
    description: string;
    creatorPrincipal: Principal;
    industry: string;
}
export interface Endorsement {
    createdAt: bigint;
    skill: string;
    endorserPrincipal: Principal;
}
export interface EducationEntry {
    field: string;
    school: string;
    year: string;
    degree: string;
}
export interface ConversationPreview {
    lastMessageAt: bigint;
    lastMessage: string;
    unreadCount: bigint;
    partner: Principal;
}
export interface UserSummary {
    principal: Principal;
    headline: string;
    name: string;
    avatar?: ExternalBlob;
}
export interface Message {
    id: bigint;
    to: Principal;
    body: string;
    from: Principal;
    createdAt: bigint;
    read: boolean;
    attachmentName?: string;
    attachment?: ExternalBlob;
}
export interface PostComment {
    id: bigint;
    body: string;
    createdAt: bigint;
    authorPrincipal: Principal;
    postId: bigint;
}
export interface Notification {
    id: bigint;
    kind: NotifKind;
    createdAt: bigint;
    read: boolean;
    referenceId: bigint;
    message: string;
    recipientPrincipal: Principal;
}
export interface GroupPost {
    id: bigint;
    postType: PostType;
    likeCount: bigint;
    body: string;
    createdAt: bigint;
    groupId: bigint;
    authorPrincipal: Principal;
}
export interface ConnRequest {
    id: bigint;
    to: Principal;
    status: ConnStatus;
    from: Principal;
    createdAt: bigint;
}
export enum ApplicationStatus {
    Applied = "Applied",
    Rejected = "Rejected",
    Accepted = "Accepted"
}
export enum ConnStatus {
    Accepted = "Accepted",
    Declined = "Declined",
    Pending = "Pending"
}
export enum NotifKind {
    PostCommented = "PostCommented",
    ConnectionAccepted = "ConnectionAccepted",
    JobApplicationReceived = "JobApplicationReceived",
    SkillEndorsed = "SkillEndorsed",
    ConnectionRequest = "ConnectionRequest",
    NewMessage = "NewMessage",
    PostLiked = "PostLiked",
    GroupPostCreated = "GroupPostCreated"
}
export enum PostType {
    Question = "Question",
    Article = "Article",
    Insight = "Insight"
}
export enum ProfileVisibility {
    ConnectionsOnly = "ConnectionsOnly",
    Public = "Public"
}
export interface backendInterface {
    addComment(postId: bigint, body: string): Promise<bigint>;
    addEndorsement(target: Principal, skill: string): Promise<void>;
    applyToJob(jobId: bigint, coverLetter: string, resume: ExternalBlob | null): Promise<bigint>;
    blockUser(target: Principal): Promise<void>;
    createGroup(name: string, description: string, industry: string): Promise<bigint>;
    createJob(title: string, company: string, description: string, requirements: string, salaryRange: string, location: string, industry: string, experienceLevel: string): Promise<bigint>;
    createPost(groupId: bigint, body: string, postType: PostType): Promise<bigint>;
    deactivateJob(id: bigint): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    getApplicationsForJob(jobId: bigint): Promise<Array<JobApplication>>;
    getBlockedUsers(): Promise<Array<Principal>>;
    getComments(postId: bigint): Promise<Array<PostComment>>;
    getConnectionRequests(): Promise<Array<ConnRequest>>;
    getConnectionSuggestions(): Promise<Array<UserSummary>>;
    getConnections(): Promise<Array<Principal>>;
    getConversations(): Promise<Array<ConversationPreview>>;
    getEndorsements(target: Principal): Promise<Array<Endorsement>>;
    getFeedPosts(limit: bigint): Promise<Array<GroupPost>>;
    getGroupPosts(groupId: bigint): Promise<Array<GroupPost>>;
    getGroups(): Promise<Array<Group>>;
    getJob(id: bigint): Promise<JobPosting | null>;
    getMessages(partner: Principal): Promise<Array<Message>>;
    getMyApplications(): Promise<Array<JobApplication>>;
    getMyGroups(): Promise<Array<Group>>;
    getMyJobs(): Promise<Array<JobPosting>>;
    getNotifications(): Promise<Array<Notification>>;
    getProfile(): Promise<Profile | null>;
    getPublicProfile(target: Principal): Promise<Profile | null>;
    getSentRequests(): Promise<Array<ConnRequest>>;
    getUnreadCount(): Promise<bigint>;
    getUnreadNotificationsCount(): Promise<bigint>;
    joinGroup(groupId: bigint): Promise<void>;
    leaveGroup(groupId: bigint): Promise<void>;
    markMessagesRead(partner: Principal): Promise<void>;
    markNotificationsRead(): Promise<void>;
    removeConnection(other: Principal): Promise<void>;
    respondToRequest(requestId: bigint, accept: boolean): Promise<void>;
    searchJobs(keyword: string, location: string, industry: string, experienceLevel: string): Promise<Array<JobPosting>>;
    searchUsers(keyword: string): Promise<Array<UserSummary>>;
    sendConnectionRequest(to: Principal): Promise<bigint>;
    sendMessage(to: Principal, body: string, attachment: ExternalBlob | null, attachmentName: string | null): Promise<bigint>;
    setAvatar(avatar: ExternalBlob | null): Promise<void>;
    setProfile(name: string, headline: string, location: string, industry: string, bio: string, skills: Array<string>, workHistory: Array<WorkEntry>, education: Array<EducationEntry>): Promise<void>;
    setResume(resume: ExternalBlob | null): Promise<void>;
    toggleLike(postId: bigint): Promise<boolean>;
    unblockUser(target: Principal): Promise<void>;
    updateApplicationStatus(applicationId: bigint, status: ApplicationStatus): Promise<void>;
    updateJob(id: bigint, title: string, company: string, description: string, requirements: string, salaryRange: string, location: string, industry: string, experienceLevel: string): Promise<void>;
    updatePrivacySettings(visibility: ProfileVisibility): Promise<void>;
}
