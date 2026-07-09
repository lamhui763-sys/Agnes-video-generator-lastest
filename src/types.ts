export interface Scene {
  id: string;
  title: string;
  dialogue: string;
  narration?: string;
  character: string;
  visualPrompt: string;
  actionPrompt?: string;
  transitionPrompt?: string;
  durationSeconds?: number;
  imageUrl?: string;
  videoUrl?: string;
  isGeneratingImage?: boolean;
  isGeneratingVideo?: boolean;
  videoProgress?: string;
  videoLogs?: string[];
  videoError?: string;
  videoErrorCode?: number;
  
  imageUrlExt?: string;
  videoUrlExt?: string;
  isGeneratingImageExt?: boolean;
  isGeneratingVideoExt?: boolean;
  videoProgressExt?: string;
  videoLogsExt?: string[];
  videoErrorExt?: string;
  videoErrorCodeExt?: number;

  imageUrlKeyframes?: string;
  videoUrlKeyframes?: string;
  isGeneratingImageKeyframes?: boolean;
  isGeneratingVideoKeyframes?: boolean;
  videoProgressKeyframes?: string;
  videoLogsKeyframes?: string[];
  videoErrorKeyframes?: string;
  videoErrorCodeKeyframes?: number;
  isRetryingPolicy?: boolean;
  policyRetryCount?: number;
  useFreezeAndMove?: boolean;
  useMidpointSplit?: boolean;
  audioCue?: string;
  directorNotes?: string;
  aiReviewStatus?: "passed" | "needs_refinement" | "reviewing";
  aiReviewAlignmentCheck?: string;
  aiReviewLogicCheck?: string;
  aiReviewContinuityCheck?: string;
  aiReviewCritique?: string;
  isReviewing?: boolean;
  hasAutoRegeneratedReview?: boolean;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role?: string;
  avatarUrl?: string;
  avatarUrls?: string[];
  uploadedAvatarUrl?: string;
  uploadedAvatarUrls?: string[];
  isGeneratingAvatar?: boolean;
  artStyle?: string;
  age?: string;
  clothing?: string;
  personality?: string;
  mood?: string;
  seed?: number;
  targetRole?: string;
  targetAge?: string;
  targetClothing?: string;
  targetPersonality?: string;
  targetMood?: string;
  targetDescription?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  novelText: string;
  scenes: Scene[];
  scenesExt?: Scene[];
  scenesFirstLast?: Scene[];
  characters: Character[];
  // Configurations
  disassemblyEngine: "mistral" | "zhipu";
  selectedModel: string;
  drawingChannel: "flux" | "sd";
  artStyle: string;
  cameraMotion: string;
  agnesVideoMode?: "fast" | "balanced" | "quality";
  agnesImageMode?: "fast" | "balanced" | "quality";
}

export interface TaskState {
  status: "idle" | "running" | "completed" | "failed" | "in_progress";
  progress: string;
  logs: string[];
  error?: string;
  errorCode?: number;
  outputPath?: string;
  prompt?: string;
}
