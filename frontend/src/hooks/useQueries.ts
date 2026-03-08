import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Principal } from "@icp-sdk/core/principal";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  ExternalBlob,
  type WorkEntry,
  type EducationEntry,
  type ProfileVisibility,
  type PostType,
  type ApplicationStatus,
} from "../backend";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

export function usePrincipal(): string {
  const { identity } = useInternetIdentity();
  return identity?.getPrincipal().toString() ?? "anonymous";
}

// Profile hooks

export function useProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["profile", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({
      name,
      headline,
      location,
      industry,
      bio,
      skills,
      workHistory,
      education,
    }: {
      name: string;
      headline: string;
      location: string;
      industry: string;
      bio: string;
      skills: Array<string>;
      workHistory: Array<WorkEntry>;
      education: Array<EducationEntry>;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setProfile(
        name,
        headline,
        location,
        industry,
        bio,
        skills,
        workHistory,
        education,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", principal] });
    },
    onError: (error) => {
      console.error(`Failed to set profile: ${getErrorMessage(error)}`);
    },
  });
}

export function useSetAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      if (!actor) throw new Error("Actor not ready");
      const blob = ExternalBlob.fromBytes(
        new Uint8Array(await file.arrayBuffer()),
      );
      return actor.setAvatar(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", principal] });
    },
    onError: (error) => {
      console.error(`Failed to upload avatar: ${getErrorMessage(error)}`);
    },
  });
}

export function useRemoveAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setAvatar(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", principal] });
    },
    onError: (error) => {
      console.error(`Failed to remove avatar: ${getErrorMessage(error)}`);
    },
  });
}

export function useSetResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      if (!actor) throw new Error("Actor not ready");
      const blob = ExternalBlob.fromBytes(
        new Uint8Array(await file.arrayBuffer()),
      );
      return actor.setResume(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", principal] });
    },
    onError: (error) => {
      console.error(`Failed to upload resume: ${getErrorMessage(error)}`);
    },
  });
}

export function useRemoveResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setResume(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", principal] });
    },
    onError: (error) => {
      console.error(`Failed to remove resume: ${getErrorMessage(error)}`);
    },
  });
}

export function usePublicProfile(target: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["publicProfile", target],
    queryFn: async () => {
      if (!actor || !target) throw new Error("Actor not ready");
      return actor.getPublicProfile(Principal.fromText(target));
    },
    enabled: !!actor && !isFetching && !!identity && target !== null,
  });
}

export function useAddEndorsement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      skill,
    }: {
      target: string;
      skill: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addEndorsement(Principal.fromText(target), skill);
    },
    onSuccess: (_, { target }) => {
      queryClient.invalidateQueries({ queryKey: ["endorsements", target] });
    },
    onError: (error) => {
      console.error(`Failed to add endorsement: ${getErrorMessage(error)}`);
    },
  });
}

export function useEndorsements(target: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["endorsements", target],
    queryFn: async () => {
      if (!actor || !target) throw new Error("Actor not ready");
      return actor.getEndorsements(Principal.fromText(target));
    },
    enabled: !!actor && !isFetching && !!identity && target !== null,
  });
}

export function useSearchUsers(query: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.searchUsers(query);
    },
    enabled: !!actor && !isFetching && !!identity && query.length >= 2,
  });
}

// Connection hooks

export function useConnectionRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["connectionRequests", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getConnectionRequests();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSentRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["sentRequests", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getSentRequests();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useConnections() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["connections", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getConnections();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useConnectionSuggestions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["connectionSuggestions", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getConnectionSuggestions();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSendConnectionRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (to: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.sendConnectionRequest(Principal.fromText(to));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections", principal] });
      queryClient.invalidateQueries({ queryKey: ["sentRequests", principal] });
      queryClient.invalidateQueries({
        queryKey: ["connectionSuggestions", principal],
      });
    },
    onError: (error) => {
      console.error(
        `Failed to send connection request: ${getErrorMessage(error)}`,
      );
    },
  });
}

export function useRespondToRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({
      requestId,
      accept,
    }: {
      requestId: bigint;
      accept: boolean;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.respondToRequest(requestId, accept);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests", principal],
      });
      queryClient.invalidateQueries({ queryKey: ["connections", principal] });
    },
    onError: (error) => {
      console.error(`Failed to respond to request: ${getErrorMessage(error)}`);
    },
  });
}

export function useRemoveConnection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (other: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeConnection(Principal.fromText(other));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections", principal] });
    },
    onError: (error) => {
      console.error(`Failed to remove connection: ${getErrorMessage(error)}`);
    },
  });
}

// Message hooks

export function useConversations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["conversations", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10000,
  });
}

export function useMessages(partner: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["messages", partner],
    queryFn: async () => {
      if (!actor || !partner) throw new Error("Actor not ready");
      return actor.getMessages(Principal.fromText(partner));
    },
    enabled: !!actor && !isFetching && !!identity && partner !== null,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({
      to,
      body,
      attachmentFile,
      attachmentName,
    }: {
      to: string;
      body: string;
      attachmentFile?: File;
      attachmentName?: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const attachment = attachmentFile
        ? ExternalBlob.fromBytes(
            new Uint8Array(await attachmentFile.arrayBuffer()),
          )
        : null;
      return actor.sendMessage(
        Principal.fromText(to),
        body,
        attachment,
        attachmentName ?? null,
      );
    },
    onSuccess: (_, { to }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", to] });
      queryClient.invalidateQueries({ queryKey: ["conversations", principal] });
    },
    onError: (error) => {
      console.error(`Failed to send message: ${getErrorMessage(error)}`);
    },
  });
}

export function useMarkMessagesRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (partner: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markMessagesRead(Principal.fromText(partner));
    },
    onSuccess: (_, partner) => {
      queryClient.invalidateQueries({ queryKey: ["messages", partner] });
      queryClient.invalidateQueries({ queryKey: ["conversations", principal] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount", principal] });
    },
    onError: (error) => {
      console.error(`Failed to mark messages read: ${getErrorMessage(error)}`);
    },
  });
}

export function useUnreadCount() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["unreadCount", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getUnreadCount();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
  });
}

// Job hooks

export function useSearchJobs(
  keyword: string,
  location: string,
  industry: string,
  experienceLevel: string,
) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["searchJobs", keyword, location, industry, experienceLevel],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.searchJobs(keyword, location, industry, experienceLevel);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useMyJobs() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["myJobs", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getMyJobs();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useJob(id: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["job", id !== null ? id.toString() : "none"],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("Actor not ready");
      return actor.getJob(id);
    },
    enabled: !!actor && !isFetching && !!identity && id !== null,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({
      title,
      company,
      description,
      requirements,
      salaryRange,
      location,
      industry,
      experienceLevel,
    }: {
      title: string;
      company: string;
      description: string;
      requirements: string;
      salaryRange: string;
      location: string;
      industry: string;
      experienceLevel: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createJob(
        title,
        company,
        description,
        requirements,
        salaryRange,
        location,
        industry,
        experienceLevel,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myJobs", principal] });
      queryClient.invalidateQueries({ queryKey: ["searchJobs"] });
    },
    onError: (error) => {
      console.error(`Failed to create job: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      company,
      description,
      requirements,
      salaryRange,
      location,
      industry,
      experienceLevel,
    }: {
      id: bigint;
      title: string;
      company: string;
      description: string;
      requirements: string;
      salaryRange: string;
      location: string;
      industry: string;
      experienceLevel: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateJob(
        id,
        title,
        company,
        description,
        requirements,
        salaryRange,
        location,
        industry,
        experienceLevel,
      );
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["job", id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["myJobs", principal] });
      queryClient.invalidateQueries({ queryKey: ["searchJobs"] });
    },
    onError: (error) => {
      console.error(`Failed to update job: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeactivateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deactivateJob(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["job", id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["myJobs", principal] });
      queryClient.invalidateQueries({ queryKey: ["searchJobs"] });
    },
    onError: (error) => {
      console.error(`Failed to deactivate job: ${getErrorMessage(error)}`);
    },
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({
      jobId,
      coverLetter,
      resumeFile,
    }: {
      jobId: bigint;
      coverLetter: string;
      resumeFile?: File;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const resume = resumeFile
        ? ExternalBlob.fromBytes(new Uint8Array(await resumeFile.arrayBuffer()))
        : null;
      return actor.applyToJob(jobId, coverLetter, resume);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myApplications", principal],
      });
    },
    onError: (error) => {
      console.error(`Failed to apply to job: ${getErrorMessage(error)}`);
    },
  });
}

export function useApplicationsForJob(jobId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: [
      "applicationsForJob",
      jobId !== null ? jobId.toString() : "none",
    ],
    queryFn: async () => {
      if (!actor || jobId === null) throw new Error("Actor not ready");
      return actor.getApplicationsForJob(jobId);
    },
    enabled: !!actor && !isFetching && !!identity && jobId !== null,
  });
}

export function useMyApplications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["myApplications", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getMyApplications();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: bigint;
      status: ApplicationStatus;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateApplicationStatus(applicationId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicationsForJob"] });
    },
    onError: (error) => {
      console.error(
        `Failed to update application status: ${getErrorMessage(error)}`,
      );
    },
  });
}

// Group hooks

export function useGroups() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getGroups();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useMyGroups() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["myGroups", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getMyGroups();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      industry,
    }: {
      name: string;
      description: string;
      industry: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createGroup(name, description, industry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups", principal] });
    },
    onError: (error) => {
      console.error(`Failed to create group: ${getErrorMessage(error)}`);
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.joinGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups", principal] });
    },
    onError: (error) => {
      console.error(`Failed to join group: ${getErrorMessage(error)}`);
    },
  });
}

export function useLeaveGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.leaveGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups", principal] });
    },
    onError: (error) => {
      console.error(`Failed to leave group: ${getErrorMessage(error)}`);
    },
  });
}

export function useGroupPosts(groupId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["groupPosts", groupId !== null ? groupId.toString() : "none"],
    queryFn: async () => {
      if (!actor || groupId === null) throw new Error("Actor not ready");
      return actor.getGroupPosts(groupId);
    },
    enabled: !!actor && !isFetching && !!identity && groupId !== null,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      body,
      postType,
    }: {
      groupId: bigint;
      body: string;
      postType: PostType;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createPost(groupId, body, postType);
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: ["groupPosts", groupId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      console.error(`Failed to create post: ${getErrorMessage(error)}`);
    },
  });
}

export function useComments(postId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["comments", postId !== null ? postId.toString() : "none"],
    queryFn: async () => {
      if (!actor || postId === null) throw new Error("Actor not ready");
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && !!identity && postId !== null,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, body }: { postId: bigint; body: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addComment(postId, body);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId.toString()],
      });
    },
    onError: (error) => {
      console.error(`Failed to add comment: ${getErrorMessage(error)}`);
    },
  });
}

export function useToggleLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.toggleLike(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      // Invalidate all groupPosts queries since we don't know which group this post belongs to
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
    },
    onError: (error) => {
      console.error(`Failed to toggle like: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      groupId,
    }: {
      postId: bigint;
      groupId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deletePost(postId);
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: ["groupPosts", groupId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      console.error(`Failed to delete post: ${getErrorMessage(error)}`);
    },
  });
}

// Feed hook

export function useFeedPosts() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["feed", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getFeedPosts(BigInt(20));
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Notification hooks

export function useNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["notifications", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", principal] });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotificationsCount", principal],
      });
    },
    onError: (error) => {
      console.error(
        `Failed to mark notifications read: ${getErrorMessage(error)}`,
      );
    },
  });
}

export function useUnreadNotificationsCount() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["unreadNotificationsCount", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getUnreadNotificationsCount();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30000,
  });
}

// Privacy hooks

export function useUpdatePrivacySettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (visibility: ProfileVisibility) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updatePrivacySettings(visibility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", principal] });
    },
    onError: (error) => {
      console.error(
        `Failed to update privacy settings: ${getErrorMessage(error)}`,
      );
    },
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (target: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.blockUser(Principal.fromText(target));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers", principal] });
      queryClient.invalidateQueries({ queryKey: ["connections", principal] });
    },
    onError: (error) => {
      console.error(`Failed to block user: ${getErrorMessage(error)}`);
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (target: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.unblockUser(Principal.fromText(target));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers", principal] });
    },
    onError: (error) => {
      console.error(`Failed to unblock user: ${getErrorMessage(error)}`);
    },
  });
}

export function useBlockedUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["blockedUsers", principal],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getBlockedUsers();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
