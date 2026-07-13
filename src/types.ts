
export interface Scene {
  id: string;
  title: string;
  dialogue: string;
  narration?: string;
  character: string;
  visualPrompt: string;
  negativePrompt?: string;
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
  videoApiLatency?: string;
  videoDownloadLatency?: string;
  videoResourceAllocation?: string;
  
  imageUrlExt?: string;
  videoUrlExt?: string;
  isGeneratingImageExt?: boolean;
  isGeneratingVideoExt?: boolean;
  videoProgressExt?: string;
  videoLogsExt?: string[];
  videoErrorExt?: string;
  videoErrorCodeExt?: number;
  videoApiLatencyExt?: string;
  videoDownloadLatencyExt?: string;
  videoResourceAllocationExt?: string;

  imageUrlKeyframes?: string;
  videoUrlKeyframes?: string;
  isGeneratingImageKeyframes?: boolean;
  isGeneratingVideoKeyframes?: boolean;
  videoProgressKeyframes?: string;
  videoLogsKeyframes?: string[];
  videoErrorKeyframes?: string;
  videoErrorCodeKeyframes?: number;
  videoApiLatencyKeyframes?: string;
  videoDownloadLatencyKeyframes?: string;
  videoResourceAllocationKeyframes?: string;
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

export const DEFAULT_SCENE: Omit<Scene, 'id' | 'title' | 'dialogue' | 'character' | 'visualPrompt'> = {
  narration: "",
  negativePrompt: "",
  actionPrompt: "",
  transitionPrompt: "",
  durationSeconds: 5,
  imageUrl: "",
  videoUrl: "",
  isGeneratingImage: false,
  isGeneratingVideo: false,
  videoProgress: "0%",
  videoLogs: [],
  videoError: "",
  videoApiLatency: "",
  videoDownloadLatency: "",
  videoResourceAllocation: "",
  imageUrlExt: "",
  videoUrlExt: "",
  isGeneratingImageExt: false,
  isGeneratingVideoExt: false,
  videoProgressExt: "0%",
  videoLogsExt: [],
  videoErrorExt: "",
  videoApiLatencyExt: "",
  videoDownloadLatencyExt: "",
  videoResourceAllocationExt: "",
  imageUrlKeyframes: "",
  videoUrlKeyframes: "",
  isGeneratingImageKeyframes: false,
  isGeneratingVideoKeyframes: false,
  videoProgressKeyframes: "0%",
  videoLogsKeyframes: [],
  videoErrorKeyframes: "",
  videoApiLatencyKeyframes: "",
  videoDownloadLatencyKeyframes: "",
  videoResourceAllocationKeyframes: "",
  audioCue: "",
  directorNotes: "",
  aiReviewStatus: "passed",
  isReviewing: false,
};

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
  finalVideoUrl?: string;
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
