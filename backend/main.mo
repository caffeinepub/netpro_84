import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {

  include MixinStorage();

  // Types

  type WorkEntry = {
    company : Text;
    title : Text;
    startYear : Text;
    endYear : Text;
    description : Text;
  };

  type EducationEntry = {
    school : Text;
    degree : Text;
    field : Text;
    year : Text;
  };

  type ProfileVisibility = { #Public; #ConnectionsOnly };

  type Profile = {
    name : Text;
    headline : Text;
    location : Text;
    industry : Text;
    bio : Text;
    skills : [Text];
    workHistory : [WorkEntry];
    education : [EducationEntry];
    avatar : ?Storage.ExternalBlob;
    resume : ?Storage.ExternalBlob;
    createdAt : Int;
    profileVisibility : ProfileVisibility;
  };

  type UserSummary = {
    principal : Principal;
    name : Text;
    headline : Text;
    avatar : ?Storage.ExternalBlob;
  };

  type Endorsement = {
    skill : Text;
    endorserPrincipal : Principal;
    createdAt : Int;
  };

  type ConnStatus = { #Pending; #Accepted; #Declined };

  type ConnRequest = {
    id : Nat;
    from : Principal;
    to : Principal;
    status : ConnStatus;
    createdAt : Int;
  };

  type Message = {
    id : Nat;
    from : Principal;
    to : Principal;
    body : Text;
    attachment : ?Storage.ExternalBlob;
    attachmentName : ?Text;
    createdAt : Int;
    read : Bool;
  };

  type ConversationPreview = {
    partner : Principal;
    lastMessage : Text;
    lastMessageAt : Int;
    unreadCount : Nat;
  };

  type JobPosting = {
    id : Nat;
    posterPrincipal : Principal;
    title : Text;
    company : Text;
    description : Text;
    requirements : Text;
    salaryRange : Text;
    location : Text;
    industry : Text;
    experienceLevel : Text;
    createdAt : Int;
    active : Bool;
  };

  type ApplicationStatus = { #Applied; #Accepted; #Rejected };

  type JobApplication = {
    id : Nat;
    jobId : Nat;
    applicantPrincipal : Principal;
    coverLetter : Text;
    resume : ?Storage.ExternalBlob;
    createdAt : Int;
    status : ApplicationStatus;
  };

  type PostType = { #Article; #Question; #Insight };

  type Group = {
    id : Nat;
    name : Text;
    description : Text;
    industry : Text;
    creatorPrincipal : Principal;
    createdAt : Int;
    memberCount : Nat;
  };

  type GroupPost = {
    id : Nat;
    groupId : Nat;
    authorPrincipal : Principal;
    body : Text;
    postType : PostType;
    createdAt : Int;
    likeCount : Nat;
  };

  type PostComment = {
    id : Nat;
    postId : Nat;
    authorPrincipal : Principal;
    body : Text;
    createdAt : Int;
  };

  type NotifKind = {
    #ConnectionRequest;
    #ConnectionAccepted;
    #NewMessage;
    #PostLiked;
    #PostCommented;
    #JobApplicationReceived;
    #GroupPostCreated;
    #SkillEndorsed;
  };

  type Notification = {
    id : Nat;
    recipientPrincipal : Principal;
    kind : NotifKind;
    referenceId : Nat;
    message : Text;
    read : Bool;
    createdAt : Int;
  };

  // State

  var userProfiles : Map.Map<Principal, Profile> = Map.empty();
  var userEndorsements : Map.Map<Principal, [Endorsement]> = Map.empty();

  var connRequests : Map.Map<Nat, ConnRequest> = Map.empty();
  var nextConnRequestId : Nat = 0;
  var userIncomingRequests : Map.Map<Principal, Map.Map<Nat, Bool>> = Map.empty();
  var userOutgoingRequests : Map.Map<Principal, Map.Map<Nat, Bool>> = Map.empty();
  var userConnections : Map.Map<Principal, Map.Map<Principal, Bool>> = Map.empty();

  var messages : Map.Map<Nat, Message> = Map.empty();
  var nextMsgId : Nat = 0;
  var userMsgIndex : Map.Map<Principal, Map.Map<Principal, Map.Map<Nat, Bool>>> = Map.empty();

  var jobPostings : Map.Map<Nat, JobPosting> = Map.empty();
  var nextJobId : Nat = 0;
  var jobApplicantIndex : Map.Map<Nat, Map.Map<Nat, Bool>> = Map.empty();
  var userApplicationsIndex : Map.Map<Principal, Map.Map<Nat, Bool>> = Map.empty();
  var jobApplications : Map.Map<Nat, JobApplication> = Map.empty();
  var nextApplicationId : Nat = 0;

  var groups : Map.Map<Nat, Group> = Map.empty();
  var nextGroupId : Nat = 0;
  var groupMemberships : Map.Map<Principal, Map.Map<Nat, Bool>> = Map.empty();
  var groupMembers : Map.Map<Nat, Map.Map<Principal, Bool>> = Map.empty();

  var groupPosts : Map.Map<Nat, GroupPost> = Map.empty();
  var nextPostId : Nat = 0;
  var groupPostIndex : Map.Map<Nat, Map.Map<Nat, Bool>> = Map.empty();

  var postComments : Map.Map<Nat, PostComment> = Map.empty();
  var nextCommentId : Nat = 0;
  var postCommentIndex : Map.Map<Nat, Map.Map<Nat, Bool>> = Map.empty();

  var postLikes : Map.Map<Nat, Map.Map<Principal, Bool>> = Map.empty();

  var userNotifications : Map.Map<Principal, Map.Map<Nat, Notification>> = Map.empty();
  var nextNotifId : Nat = 0;

  var blockedUsers : Map.Map<Principal, Map.Map<Principal, Bool>> = Map.empty();

  // Constants

  let MAX_NOTIFICATIONS_PER_USER : Nat = 200;

  // Helpers

  func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Not authenticated");
    };
  };

  func isBlocked(blocker : Principal, target : Principal) : Bool {
    switch (blockedUsers.get(blocker)) {
      case (?m) { m.get(target) != null };
      case (null) { false };
    };
  };

  func getUserConns(user : Principal) : Map.Map<Principal, Bool> {
    switch (userConnections.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Principal, Bool>();
        userConnections.add(user, m);
        m;
      };
    };
  };

  func getUserIncoming(user : Principal) : Map.Map<Nat, Bool> {
    switch (userIncomingRequests.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Bool>();
        userIncomingRequests.add(user, m);
        m;
      };
    };
  };

  func getUserOutgoing(user : Principal) : Map.Map<Nat, Bool> {
    switch (userOutgoingRequests.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Bool>();
        userOutgoingRequests.add(user, m);
        m;
      };
    };
  };

  func getUserMsgThread(user : Principal, partner : Principal) : Map.Map<Nat, Bool> {
    let userIndex = switch (userMsgIndex.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Principal, Map.Map<Nat, Bool>>();
        userMsgIndex.add(user, m);
        m;
      };
    };
    switch (userIndex.get(partner)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Bool>();
        userIndex.add(partner, m);
        m;
      };
    };
  };

  func getGroupMemberships(user : Principal) : Map.Map<Nat, Bool> {
    switch (groupMemberships.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Bool>();
        groupMemberships.add(user, m);
        m;
      };
    };
  };

  func getGroupMemberSet(groupId : Nat) : Map.Map<Principal, Bool> {
    switch (groupMembers.get(groupId)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Principal, Bool>();
        groupMembers.add(groupId, m);
        m;
      };
    };
  };

  func getGroupPostSet(groupId : Nat) : Map.Map<Nat, Bool> {
    switch (groupPostIndex.get(groupId)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Bool>();
        groupPostIndex.add(groupId, m);
        m;
      };
    };
  };

  func getPostCommentSet(postId : Nat) : Map.Map<Nat, Bool> {
    switch (postCommentIndex.get(postId)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Bool>();
        postCommentIndex.add(postId, m);
        m;
      };
    };
  };

  func getPostLikeSet(postId : Nat) : Map.Map<Principal, Bool> {
    switch (postLikes.get(postId)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Principal, Bool>();
        postLikes.add(postId, m);
        m;
      };
    };
  };

  func getUserNotifMap(user : Principal) : Map.Map<Nat, Notification> {
    switch (userNotifications.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Notification>();
        userNotifications.add(user, m);
        m;
      };
    };
  };

  func emitNotif(recipient : Principal, kind : NotifKind, refId : Nat, msg : Text) {
    if (not recipient.isAnonymous()) {
      let notifMap = getUserNotifMap(recipient);
      if (notifMap.size() >= MAX_NOTIFICATIONS_PER_USER) {
        var oldestId : ?Nat = null;
        for ((id, _) in notifMap.entries()) {
          switch (oldestId) {
            case (null) { oldestId := ?id };
            case (?current) {
              if (id < current) { oldestId := ?id };
            };
          };
        };
        switch (oldestId) {
          case (?id) { notifMap.remove(id) };
          case (null) {};
        };
      };
      let notif : Notification = {
        id = nextNotifId;
        recipientPrincipal = recipient;
        kind;
        referenceId = refId;
        message = msg;
        read = false;
        createdAt = Time.now();
      };
      notifMap.add(nextNotifId, notif);
      nextNotifId += 1;
    };
  };

  func isConnected(a : Principal, b : Principal) : Bool {
    switch (userConnections.get(a)) {
      case (?m) { m.get(b) != null };
      case (null) { false };
    };
  };

  func textContains(haystack : Text, needle : Text) : Bool {
    let h = haystack.toLower();
    let n = needle.toLower();
    if (n == "") { return true };
    var found = false;
    var i = 0;
    let hChars = Array.fromIter(h.chars());
    let nChars = Array.fromIter(n.chars());
    let hLen = hChars.size();
    let nLen = nChars.size();
    while (i + nLen <= hLen) {
      var match = true;
      var j = 0;
      while (j < nLen) {
        if (hChars[i + j] != nChars[j]) { match := false };
        j += 1;
      };
      if (match) { found := true };
      i += 1;
    };
    found;
  };

  // Read-only version that does not mutate state (safe for query calls)
  func getUserMsgThreadReadOnly(user : Principal, partner : Principal) : Map.Map<Nat, Bool> {
    switch (userMsgIndex.get(user)) {
      case (?userIndex) {
        switch (userIndex.get(partner)) {
          case (?m) { m };
          case (null) { Map.empty<Nat, Bool>() };
        };
      };
      case (null) { Map.empty<Nat, Bool>() };
    };
  };

  func isGroupMember(user : Principal, groupId : Nat) : Bool {
    switch (groupMemberships.get(user)) {
      case (?m) { m.get(groupId) != null };
      case (null) { false };
    };
  };

  func requireGroupMember(caller : Principal, groupId : Nat) {
    if (not isGroupMember(caller, groupId)) {
      Runtime.trap("Must be a group member");
    };
  };

  // Profile Endpoints

  public shared ({ caller }) func setProfile(
    name : Text,
    headline : Text,
    location : Text,
    industry : Text,
    bio : Text,
    skills : [Text],
    workHistory : [WorkEntry],
    education : [EducationEntry],
  ) : async () {
    requireAuth(caller);
    if (name == "") { Runtime.trap("Name cannot be empty") };
    if (name.size() > 100) { Runtime.trap("Name too long") };
    if (headline.size() > 200) { Runtime.trap("Headline too long") };
    if (location.size() > 100) { Runtime.trap("Location too long") };
    if (industry.size() > 100) { Runtime.trap("Industry too long") };
    if (bio.size() > 2000) { Runtime.trap("Bio too long") };
    if (skills.size() > 50) { Runtime.trap("Too many skills") };
    for (skill in skills.vals()) {
      if (skill.size() > 100) { Runtime.trap("Skill name too long") };
    };
    if (workHistory.size() > 50) {
      Runtime.trap("Too many work history entries");
    };
    for (entry in workHistory.vals()) {
      if (entry.company.size() > 200) { Runtime.trap("Company name too long") };
      if (entry.title.size() > 200) { Runtime.trap("Job title too long") };
      if (entry.description.size() > 2000) {
        Runtime.trap("Work description too long");
      };
    };
    if (education.size() > 20) { Runtime.trap("Too many education entries") };
    for (entry in education.vals()) {
      if (entry.school.size() > 200) { Runtime.trap("School name too long") };
      if (entry.degree.size() > 200) { Runtime.trap("Degree too long") };
      if (entry.field.size() > 200) { Runtime.trap("Field of study too long") };
    };
    let existing = userProfiles.get(caller);
    let createdAt = switch (existing) {
      case (?p) { p.createdAt };
      case (null) { Time.now() };
    };
    let visibility = switch (existing) {
      case (?p) { p.profileVisibility };
      case (null) { #Public };
    };
    let avatar = switch (existing) {
      case (?p) { p.avatar };
      case (null) { null };
    };
    let resume = switch (existing) {
      case (?p) { p.resume };
      case (null) { null };
    };
    userProfiles.add(
      caller,
      {
        name;
        headline;
        location;
        industry;
        bio;
        skills;
        workHistory;
        education;
        avatar;
        resume;
        createdAt;
        profileVisibility = visibility;
      },
    );
  };

  public query ({ caller }) func getProfile() : async ?Profile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getPublicProfile(target : Principal) : async ?Profile {
    requireAuth(caller);
    if (isBlocked(target, caller)) { return null };
    switch (userProfiles.get(target)) {
      case (null) { null };
      case (?p) {
        switch (p.profileVisibility) {
          case (#Public) { ?p };
          case (#ConnectionsOnly) {
            if (isConnected(caller, target)) { ?p } else { null };
          };
        };
      };
    };
  };

  public shared ({ caller }) func addEndorsement(target : Principal, skill : Text) : async () {
    requireAuth(caller);
    if (not isConnected(caller, target)) {
      Runtime.trap("Must be connected to endorse");
    };
    if (caller == target) { Runtime.trap("Cannot endorse yourself") };
    let existing = switch (userEndorsements.get(target)) {
      case (?arr) { arr };
      case (null) { [] };
    };
    // Prevent duplicate endorsement of same skill by same person
    for (e in existing.vals()) {
      if (e.endorserPrincipal == caller and e.skill == skill) {
        Runtime.trap("Already endorsed this skill");
      };
    };
    let newEndorsement : Endorsement = {
      skill;
      endorserPrincipal = caller;
      createdAt = Time.now();
    };
    userEndorsements.add(target, existing.concat([newEndorsement]));
    emitNotif(target, #SkillEndorsed, 0, "Someone endorsed your skill: " # skill);
  };

  public query ({ caller }) func getEndorsements(target : Principal) : async [Endorsement] {
    requireAuth(caller);
    if (caller != target) {
      switch (userProfiles.get(target)) {
        case (null) { return [] };
        case (?p) {
          switch (p.profileVisibility) {
            case (#Public) {};
            case (#ConnectionsOnly) {
              if (not isConnected(caller, target)) { return [] };
            };
          };
        };
      };
    };
    switch (userEndorsements.get(target)) {
      case (?arr) { arr };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func setAvatar(avatar : ?Storage.ExternalBlob) : async () {
    requireAuth(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { userProfiles.add(caller, { p with avatar }) };
    };
  };

  public shared ({ caller }) func setResume(resume : ?Storage.ExternalBlob) : async () {
    requireAuth(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { userProfiles.add(caller, { p with resume }) };
    };
  };

  // Connection Endpoints

  public shared ({ caller }) func sendConnectionRequest(to : Principal) : async Nat {
    requireAuth(caller);
    if (caller == to) { Runtime.trap("Cannot connect to yourself") };
    if (userProfiles.get(to) == null) { Runtime.trap("User not found") };
    if (isBlocked(to, caller)) { Runtime.trap("Cannot send request") };
    if (isConnected(caller, to)) { Runtime.trap("Already connected") };
    // Check no pending request already
    let outgoing = getUserOutgoing(caller);
    for (reqId in Iter.fromArray(Array.fromIter(outgoing.keys()))) {
      switch (connRequests.get(reqId)) {
        case (?req) {
          if (req.to == to and req.status == #Pending) {
            Runtime.trap("Request already pending");
          };
        };
        case (null) {};
      };
    };
    let id = nextConnRequestId;
    nextConnRequestId += 1;
    let req : ConnRequest = {
      id;
      from = caller;
      to;
      status = #Pending;
      createdAt = Time.now();
    };
    connRequests.add(id, req);
    getUserIncoming(to).add(id, true);
    getUserOutgoing(caller).add(id, true);
    emitNotif(to, #ConnectionRequest, id, "You have a new connection request");
    id;
  };

  public shared ({ caller }) func respondToRequest(requestId : Nat, accept : Bool) : async () {
    requireAuth(caller);
    switch (connRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) {
        if (req.to != caller) { Runtime.trap("Not your request") };
        if (req.status != #Pending) { Runtime.trap("Request already resolved") };
        let newStatus = if (accept) { #Accepted } else { #Declined };
        connRequests.add(requestId, { req with status = newStatus });
        if (accept) {
          getUserConns(caller).add(req.from, true);
          getUserConns(req.from).add(caller, true);
          emitNotif(req.from, #ConnectionAccepted, requestId, "Your connection request was accepted");
        };
      };
    };
  };

  public query ({ caller }) func getConnectionRequests() : async [ConnRequest] {
    requireAuth(caller);
    let incoming = getUserIncoming(caller);
    var result : [ConnRequest] = [];
    for (reqId in Iter.fromArray(Array.fromIter(incoming.keys()))) {
      switch (connRequests.get(reqId)) {
        case (?req) {
          if (req.status == #Pending) {
            result := result.concat([req]);
          };
        };
        case (null) {};
      };
    };
    result;
  };

  public query ({ caller }) func getSentRequests() : async [ConnRequest] {
    requireAuth(caller);
    let outgoing = getUserOutgoing(caller);
    var result : [ConnRequest] = [];
    for (reqId in Iter.fromArray(Array.fromIter(outgoing.keys()))) {
      switch (connRequests.get(reqId)) {
        case (?req) {
          if (req.status == #Pending) {
            result := result.concat([req]);
          };
        };
        case (null) {};
      };
    };
    result;
  };

  public query ({ caller }) func getConnections() : async [Principal] {
    requireAuth(caller);
    let conns = getUserConns(caller);
    Array.fromIter(conns.keys());
  };

  public query ({ caller }) func getConnectionSuggestions() : async [UserSummary] {
    requireAuth(caller);
    let myConns = getUserConns(caller);
    var suggestions : [UserSummary] = [];
    let myProfile = userProfiles.get(caller);
    let mySkills : [Text] = switch (myProfile) {
      case (?p) { p.skills };
      case (null) { [] };
    };
    let myLocation : Text = switch (myProfile) {
      case (?p) { p.location.toLower() };
      case (null) { "" };
    };
    let myIndustry : Text = switch (myProfile) {
      case (?p) { p.industry.toLower() };
      case (null) { "" };
    };
    for (principal in Iter.fromArray(Array.fromIter(userProfiles.keys()))) {
      if (principal != caller and myConns.get(principal) == null and not isBlocked(caller, principal)) {
        switch (userProfiles.get(principal)) {
          case (?p) {
            var skillMatch = false;
            for (skill in p.skills.vals()) {
              for (mySkill in mySkills.vals()) {
                if (skill.toLower() == mySkill.toLower()) { skillMatch := true };
              };
            };
            let locationMatch = myLocation != "" and p.location != "" and p.location.toLower() == myLocation;
            let industryMatch = myIndustry != "" and p.industry != "" and p.industry.toLower() == myIndustry;
            if (skillMatch or locationMatch or industryMatch) {
              suggestions := suggestions.concat([{
                principal;
                name = p.name;
                headline = p.headline;
                avatar = p.avatar;
              }]);
            };
          };
          case (null) {};
        };
      };
    };
    if (suggestions.size() > 10) {
      suggestions.sliceToArray(0, 10);
    } else {
      suggestions;
    };
  };

  public shared ({ caller }) func removeConnection(other : Principal) : async () {
    requireAuth(caller);
    getUserConns(caller).remove(other);
    getUserConns(other).remove(caller);
  };

  // Messaging Endpoints

  public shared ({ caller }) func sendMessage(
    to : Principal,
    body : Text,
    attachment : ?Storage.ExternalBlob,
    attachmentName : ?Text,
  ) : async Nat {
    requireAuth(caller);
    if (body == "" and attachment == null) {
      Runtime.trap("Message cannot be empty");
    };
    if (isBlocked(to, caller)) { Runtime.trap("Cannot send message") };
    if (not isConnected(caller, to)) {
      Runtime.trap("Must be connected to message");
    };
    let id = nextMsgId;
    nextMsgId += 1;
    let msg : Message = {
      id;
      from = caller;
      to;
      body;
      attachment;
      attachmentName;
      createdAt = Time.now();
      read = false;
    };
    messages.add(id, msg);
    getUserMsgThread(caller, to).add(id, true);
    getUserMsgThread(to, caller).add(id, true);
    emitNotif(to, #NewMessage, id, "You have a new message");
    id;
  };

  public query ({ caller }) func getConversations() : async [ConversationPreview] {
    requireAuth(caller);
    let userIndex = switch (userMsgIndex.get(caller)) {
      case (?m) { m };
      case (null) { return [] };
    };
    var result : [ConversationPreview] = [];
    for (partner in Iter.fromArray(Array.fromIter(userIndex.keys()))) {
      let thread = getUserMsgThreadReadOnly(caller, partner);
      var lastMsg = "";
      var lastAt : Int = 0;
      var unread : Nat = 0;
      for (msgId in Iter.fromArray(Array.fromIter(thread.keys()))) {
        switch (messages.get(msgId)) {
          case (?m) {
            if (m.createdAt > lastAt) {
              lastAt := m.createdAt;
              lastMsg := if (m.body == "") { "Sent an attachment" } else {
                m.body;
              };
            };
            if (m.to == caller and not m.read) {
              unread += 1;
            };
          };
          case (null) {};
        };
      };
      if (lastAt > 0) {
        result := result.concat([{
          partner;
          lastMessage = lastMsg;
          lastMessageAt = lastAt;
          unreadCount = unread;
        }]);
      };
    };
    result;
  };

  public query ({ caller }) func getMessages(partner : Principal) : async [Message] {
    requireAuth(caller);
    let thread = getUserMsgThreadReadOnly(caller, partner);
    var result : [Message] = [];
    for (msgId in Iter.fromArray(Array.fromIter(thread.keys()))) {
      switch (messages.get(msgId)) {
        case (?m) { result := result.concat([m]) };
        case (null) {};
      };
    };
    // Sort by createdAt ascending
    result.sort(
      func(a, b) {
        if (a.createdAt < b.createdAt) { #less } else if (a.createdAt > b.createdAt) {
          #greater;
        } else { #equal };
      }
    );
  };

  public shared ({ caller }) func markMessagesRead(partner : Principal) : async () {
    requireAuth(caller);
    let thread = getUserMsgThread(caller, partner);
    for (msgId in Iter.fromArray(Array.fromIter(thread.keys()))) {
      switch (messages.get(msgId)) {
        case (?m) {
          if (m.to == caller and not m.read) {
            messages.add(msgId, { m with read = true });
          };
        };
        case (null) {};
      };
    };
  };

  public query ({ caller }) func getUnreadCount() : async Nat {
    requireAuth(caller);
    let userIndex = switch (userMsgIndex.get(caller)) {
      case (?m) { m };
      case (null) { return 0 };
    };
    var count : Nat = 0;
    for (partner in Iter.fromArray(Array.fromIter(userIndex.keys()))) {
      let thread = getUserMsgThreadReadOnly(caller, partner);
      for (msgId in Iter.fromArray(Array.fromIter(thread.keys()))) {
        switch (messages.get(msgId)) {
          case (?m) {
            if (m.to == caller and not m.read) { count += 1 };
          };
          case (null) {};
        };
      };
    };
    count;
  };

  // Job Endpoints

  public shared ({ caller }) func createJob(
    title : Text,
    company : Text,
    description : Text,
    requirements : Text,
    salaryRange : Text,
    location : Text,
    industry : Text,
    experienceLevel : Text,
  ) : async Nat {
    requireAuth(caller);
    if (title == "") { Runtime.trap("Title cannot be empty") };
    let id = nextJobId;
    nextJobId += 1;
    jobPostings.add(
      id,
      {
        id;
        posterPrincipal = caller;
        title;
        company;
        description;
        requirements;
        salaryRange;
        location;
        industry;
        experienceLevel;
        createdAt = Time.now();
        active = true;
      },
    );
    id;
  };

  public shared ({ caller }) func updateJob(
    id : Nat,
    title : Text,
    company : Text,
    description : Text,
    requirements : Text,
    salaryRange : Text,
    location : Text,
    industry : Text,
    experienceLevel : Text,
  ) : async () {
    requireAuth(caller);
    switch (jobPostings.get(id)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (job.posterPrincipal != caller) { Runtime.trap("Not your job") };
        jobPostings.add(
          id,
          {
            job with
            title;
            company;
            description;
            requirements;
            salaryRange;
            location;
            industry;
            experienceLevel;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deactivateJob(id : Nat) : async () {
    requireAuth(caller);
    switch (jobPostings.get(id)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (job.posterPrincipal != caller) { Runtime.trap("Not your job") };
        jobPostings.add(id, { job with active = false });
      };
    };
  };

  public query ({ caller }) func getMyJobs() : async [JobPosting] {
    requireAuth(caller);
    var result : [JobPosting] = [];
    for ((_, job) in jobPostings.entries()) {
      if (job.posterPrincipal == caller) {
        result := result.concat([job]);
      };
    };
    result;
  };

  public query ({ caller }) func searchJobs(keyword : Text, location : Text, industry : Text, experienceLevel : Text) : async [JobPosting] {
    requireAuth(caller);
    var result : [JobPosting] = [];
    for ((_, job) in jobPostings.entries()) {
      if (job.active) {
        let matchKeyword = keyword == "" or textContains(job.title, keyword) or textContains(job.description, keyword) or textContains(job.company, keyword);
        let matchLocation = location == "" or textContains(job.location, location);
        let matchIndustry = industry == "" or job.industry == industry;
        let matchLevel = experienceLevel == "" or job.experienceLevel == experienceLevel;
        if (matchKeyword and matchLocation and matchIndustry and matchLevel) {
          result := result.concat([job]);
        };
      };
    };
    result;
  };

  public query ({ caller }) func getJob(id : Nat) : async ?JobPosting {
    requireAuth(caller);
    jobPostings.get(id);
  };

  public shared ({ caller }) func applyToJob(jobId : Nat, coverLetter : Text, resume : ?Storage.ExternalBlob) : async Nat {
    requireAuth(caller);
    switch (jobPostings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (not job.active) { Runtime.trap("Job is no longer active") };
        // Prevent duplicate application
        let appIndex = switch (jobApplicantIndex.get(jobId)) {
          case (?m) { m };
          case (null) {
            let m = Map.empty<Nat, Bool>();
            jobApplicantIndex.add(jobId, m);
            m;
          };
        };
        let userApps = switch (userApplicationsIndex.get(caller)) {
          case (?m) { m };
          case (null) {
            let m = Map.empty<Nat, Bool>();
            userApplicationsIndex.add(caller, m);
            m;
          };
        };
        for (appId in Iter.fromArray(Array.fromIter(userApps.keys()))) {
          switch (jobApplications.get(appId)) {
            case (?app) {
              if (app.jobId == jobId) { Runtime.trap("Already applied") };
            };
            case (null) {};
          };
        };
        let id = nextApplicationId;
        nextApplicationId += 1;
        let application : JobApplication = {
          id;
          jobId;
          applicantPrincipal = caller;
          coverLetter;
          resume;
          createdAt = Time.now();
          status = #Applied;
        };
        jobApplications.add(id, application);
        appIndex.add(id, true);
        userApps.add(id, true);
        emitNotif(job.posterPrincipal, #JobApplicationReceived, id, "Your job posting received a new application");
        id;
      };
    };
  };

  public query ({ caller }) func getApplicationsForJob(jobId : Nat) : async [JobApplication] {
    requireAuth(caller);
    switch (jobPostings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (job.posterPrincipal != caller) { Runtime.trap("Not your job") };
        let appIndex = switch (jobApplicantIndex.get(jobId)) {
          case (?m) { m };
          case (null) { return [] };
        };
        var result : [JobApplication] = [];
        for (appId in Iter.fromArray(Array.fromIter(appIndex.keys()))) {
          switch (jobApplications.get(appId)) {
            case (?app) { result := result.concat([app]) };
            case (null) {};
          };
        };
        result;
      };
    };
  };

  public query ({ caller }) func getMyApplications() : async [JobApplication] {
    requireAuth(caller);
    let userApps = switch (userApplicationsIndex.get(caller)) {
      case (?m) { m };
      case (null) { return [] };
    };
    var result : [JobApplication] = [];
    for (appId in Iter.fromArray(Array.fromIter(userApps.keys()))) {
      switch (jobApplications.get(appId)) {
        case (?app) { result := result.concat([app]) };
        case (null) {};
      };
    };
    result;
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, status : ApplicationStatus) : async () {
    requireAuth(caller);
    switch (jobApplications.get(applicationId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?app) {
        switch (jobPostings.get(app.jobId)) {
          case (null) { Runtime.trap("Job not found") };
          case (?job) {
            if (job.posterPrincipal != caller) { Runtime.trap("Not your job") };
            jobApplications.add(applicationId, { app with status });
          };
        };
      };
    };
  };

  // Group Endpoints

  public shared ({ caller }) func createGroup(name : Text, description : Text, industry : Text) : async Nat {
    requireAuth(caller);
    if (name == "") { Runtime.trap("Name cannot be empty") };
    let id = nextGroupId;
    nextGroupId += 1;
    groups.add(
      id,
      {
        id;
        name;
        description;
        industry;
        creatorPrincipal = caller;
        createdAt = Time.now();
        memberCount = 1;
      },
    );
    getGroupMemberships(caller).add(id, true);
    getGroupMemberSet(id).add(caller, true);
    id;
  };

  public shared ({ caller }) func joinGroup(groupId : Nat) : async () {
    requireAuth(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?g) {
        let memberships = getGroupMemberships(caller);
        if (memberships.get(groupId) != null) {
          Runtime.trap("Already a member");
        };
        memberships.add(groupId, true);
        getGroupMemberSet(groupId).add(caller, true);
        groups.add(groupId, { g with memberCount = g.memberCount + 1 });
      };
    };
  };

  public shared ({ caller }) func leaveGroup(groupId : Nat) : async () {
    requireAuth(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?g) {
        let memberships = getGroupMemberships(caller);
        if (memberships.get(groupId) == null) { Runtime.trap("Not a member") };
        if (g.creatorPrincipal == caller) {
          Runtime.trap("Group creator cannot leave");
        };
        memberships.remove(groupId);
        getGroupMemberSet(groupId).remove(caller);
        if (g.memberCount > 0) {
          groups.add(groupId, { g with memberCount = Int.abs(g.memberCount - 1) });
        };
      };
    };
  };

  public query ({ caller }) func getGroups() : async [Group] {
    requireAuth(caller);
    var result : [Group] = [];
    for ((_, g) in groups.entries()) {
      result := result.concat([g]);
    };
    result;
  };

  public query ({ caller }) func getMyGroups() : async [Group] {
    requireAuth(caller);
    let memberships = getGroupMemberships(caller);
    var result : [Group] = [];
    for (groupId in Iter.fromArray(Array.fromIter(memberships.keys()))) {
      switch (groups.get(groupId)) {
        case (?g) { result := result.concat([g]) };
        case (null) {};
      };
    };
    result;
  };

  public shared ({ caller }) func createPost(groupId : Nat, body : Text, postType : PostType) : async Nat {
    requireAuth(caller);
    if (body == "") { Runtime.trap("Post cannot be empty") };
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?_) {
        let memberships = getGroupMemberships(caller);
        if (memberships.get(groupId) == null) {
          Runtime.trap("Must be a member to post");
        };
        let id = nextPostId;
        nextPostId += 1;
        groupPosts.add(
          id,
          {
            id;
            groupId;
            authorPrincipal = caller;
            body;
            postType;
            createdAt = Time.now();
            likeCount = 0;
          },
        );
        getGroupPostSet(groupId).add(id, true);
        // Notify group members
        let memberSet = getGroupMemberSet(groupId);
        for (member in Iter.fromArray(Array.fromIter(memberSet.keys()))) {
          if (member != caller) {
            emitNotif(member, #GroupPostCreated, id, "New post in a group you follow");
          };
        };
        id;
      };
    };
  };

  public query ({ caller }) func getGroupPosts(groupId : Nat) : async [GroupPost] {
    requireAuth(caller);
    requireGroupMember(caller, groupId);
    let postSet = getGroupPostSet(groupId);
    var result : [GroupPost] = [];
    for (postId in Iter.fromArray(Array.fromIter(postSet.keys()))) {
      switch (groupPosts.get(postId)) {
        case (?p) { result := result.concat([p]) };
        case (null) {};
      };
    };
    result.sort(
      func(a, b) {
        if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) {
          #greater;
        } else { #equal };
      }
    );
  };

  public shared ({ caller }) func addComment(postId : Nat, body : Text) : async Nat {
    requireAuth(caller);
    if (body == "") { Runtime.trap("Comment cannot be empty") };
    switch (groupPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        requireGroupMember(caller, post.groupId);
        let id = nextCommentId;
        nextCommentId += 1;
        postComments.add(
          id,
          {
            id;
            postId;
            authorPrincipal = caller;
            body;
            createdAt = Time.now();
          },
        );
        getPostCommentSet(postId).add(id, true);
        if (post.authorPrincipal != caller) {
          emitNotif(post.authorPrincipal, #PostCommented, postId, "Someone commented on your post");
        };
        id;
      };
    };
  };

  public query ({ caller }) func getComments(postId : Nat) : async [PostComment] {
    requireAuth(caller);
    switch (groupPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { requireGroupMember(caller, post.groupId) };
    };
    let commentSet = getPostCommentSet(postId);
    var result : [PostComment] = [];
    for (commentId in Iter.fromArray(Array.fromIter(commentSet.keys()))) {
      switch (postComments.get(commentId)) {
        case (?c) { result := result.concat([c]) };
        case (null) {};
      };
    };
    result.sort(
      func(a, b) {
        if (a.createdAt < b.createdAt) { #less } else if (a.createdAt > b.createdAt) {
          #greater;
        } else { #equal };
      }
    );
  };

  public shared ({ caller }) func toggleLike(postId : Nat) : async Bool {
    requireAuth(caller);
    switch (groupPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        requireGroupMember(caller, post.groupId);
        let likeSet = getPostLikeSet(postId);
        if (likeSet.get(caller) != null) {
          likeSet.remove(caller);
          groupPosts.add(postId, { post with likeCount = if (post.likeCount > 0) { Int.abs(post.likeCount - 1) } else { 0 } });
          false;
        } else {
          likeSet.add(caller, true);
          groupPosts.add(postId, { post with likeCount = post.likeCount + 1 });
          if (post.authorPrincipal != caller) {
            emitNotif(post.authorPrincipal, #PostLiked, postId, "Someone liked your post");
          };
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    requireAuth(caller);
    switch (groupPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let canDelete = post.authorPrincipal == caller or (
          switch (groups.get(post.groupId)) {
            case (?g) { g.creatorPrincipal == caller };
            case (null) { false };
          }
        );
        if (not canDelete) { Runtime.trap("Cannot delete this post") };
        groupPosts.remove(postId);
        getGroupPostSet(post.groupId).remove(postId);
      };
    };
  };

  // Notification Endpoints

  public query ({ caller }) func getNotifications() : async [Notification] {
    requireAuth(caller);
    let notifMap = getUserNotifMap(caller);
    var result : [Notification] = [];
    for ((_, notif) in notifMap.entries()) {
      result := result.concat([notif]);
    };
    result.sort(
      func(a, b) {
        if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) {
          #greater;
        } else { #equal };
      }
    );
  };

  public shared ({ caller }) func markNotificationsRead() : async () {
    requireAuth(caller);
    let notifMap = getUserNotifMap(caller);
    for ((_, notif) in notifMap.entries()) {
      if (not notif.read) {
        notifMap.add(notif.id, { notif with read = true });
      };
    };
  };

  public query ({ caller }) func getUnreadNotificationsCount() : async Nat {
    requireAuth(caller);
    let notifMap = getUserNotifMap(caller);
    var count : Nat = 0;
    for ((_, notif) in notifMap.entries()) {
      if (not notif.read) { count += 1 };
    };
    count;
  };

  // Privacy & Safety Endpoints

  public shared ({ caller }) func updatePrivacySettings(visibility : ProfileVisibility) : async () {
    requireAuth(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) {
        userProfiles.add(caller, { p with profileVisibility = visibility });
      };
    };
  };

  public shared ({ caller }) func blockUser(target : Principal) : async () {
    requireAuth(caller);
    if (caller == target) { Runtime.trap("Cannot block yourself") };
    let blocked = switch (blockedUsers.get(caller)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Principal, Bool>();
        blockedUsers.add(caller, m);
        m;
      };
    };
    blocked.add(target, true);
    // Remove connection if exists
    getUserConns(caller).remove(target);
    getUserConns(target).remove(caller);
  };

  public shared ({ caller }) func unblockUser(target : Principal) : async () {
    requireAuth(caller);
    switch (blockedUsers.get(caller)) {
      case (?m) { m.remove(target) };
      case (null) {};
    };
  };

  public query ({ caller }) func getBlockedUsers() : async [Principal] {
    requireAuth(caller);
    switch (blockedUsers.get(caller)) {
      case (?m) { Array.fromIter(m.keys()) };
      case (null) { [] };
    };
  };

  // Feed Endpoint — returns recent group posts across all joined groups

  public query ({ caller }) func getFeedPosts(limit : Nat) : async [GroupPost] {
    requireAuth(caller);
    let memberships = getGroupMemberships(caller);
    var result : [GroupPost] = [];
    for (groupId in Iter.fromArray(Array.fromIter(memberships.keys()))) {
      let postSet = getGroupPostSet(groupId);
      for (postId in Iter.fromArray(Array.fromIter(postSet.keys()))) {
        switch (groupPosts.get(postId)) {
          case (?p) { result := result.concat([p]) };
          case (null) {};
        };
      };
    };
    let sorted = result.sort(
      func(a, b) {
        if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) {
          #greater;
        } else { #equal };
      }
    );
    if (sorted.size() > limit and limit > 0) {
      sorted.sliceToArray(0, limit);
    } else {
      sorted;
    };
  };

  // Search users by name/headline

  public query ({ caller }) func searchUsers(keyword : Text) : async [UserSummary] {
    requireAuth(caller);
    if (keyword == "") { return [] };
    var result : [UserSummary] = [];
    for ((principal, p) in userProfiles.entries()) {
      if (textContains(p.name, keyword) or textContains(p.headline, keyword)) {
        result := result.concat([{
          principal;
          name = p.name;
          headline = p.headline;
          avatar = p.avatar;
        }]);
      };
    };
    if (result.size() > 20) {
      result.sliceToArray(0, 20);
    } else {
      result;
    };
  };

};
