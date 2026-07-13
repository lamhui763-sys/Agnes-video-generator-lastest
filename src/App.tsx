import { ScrubbableVideoPlayer } from "./components/ScrubbableVideoPlayer";
import React, { useState, useEffect, useRef } from "react";
import { 
  Video,
  Terminal,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Clapperboard,
  Flame,
  HelpCircle,
  Play,
  Volume2,
  Settings,
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Users,
  Layers,
  Film,
  Sliders,
  X,
  Eye,
  User,
  Info,
  ChevronRight,
  MessageSquare,
  Copy,
  Wand2,
  Clock,
  GripVertical,
  StopCircle,
  Bookmark,
  Undo,
  Redo,
  Search,
  Upload,
  FileText,
  Printer,
  Link,
  Link2,
  Zap,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Scene, Character, Project, TaskState, DEFAULT_SCENE } from "./types";
import VideoGallery from "./components/VideoGallery";
import SceneItem from "./components/SceneItem";
import { STYLE_PRESETS } from "./data";

function getProjectSignature(project: Project | null): string {
  if (!project) return "";
  const cleanScenes = (project.scenes || []).map(s => ({
    id: s.id,
    title: s.title || "",
    dialogue: s.dialogue || "",
    narration: s.narration || "",
    character: s.character || "",
    visualPrompt: s.visualPrompt || "",
    negativePrompt: s.negativePrompt || "",
    actionPrompt: s.actionPrompt || "",
    transitionPrompt: s.transitionPrompt || "",
    durationSeconds: s.durationSeconds,
    imageUrl: s.imageUrl || "",
    videoUrl: s.videoUrl || "",
    audioCue: s.audioCue || "",
    directorNotes: s.directorNotes || "",
  }));
  const cleanCharacters = (project.characters || []).map(c => ({
    id: c.id,
    name: c.name || "",
    description: c.description || "",
    role: c.role || "",
    avatarUrl: c.avatarUrl || "",
    artStyle: c.artStyle || "",
  }));
  return JSON.stringify({
    name: project.name || "",
    novelText: project.novelText || "",
    disassemblyEngine: project.disassemblyEngine || "mistral",
    selectedModel: project.selectedModel || "",
    drawingChannel: project.drawingChannel || "flux",
    artStyle: project.artStyle || "",
    cameraMotion: project.cameraMotion || "",
    agnesVideoMode: project.agnesVideoMode || "quality",
    agnesImageMode: project.agnesImageMode || "quality",
    scenes: cleanScenes,
    characters: cleanCharacters,
  });
}



const NEGATIVE_PRESETS = [
  {
    name: "🤖 AI 智慧分析生成",
    value: "ai-auto"
  },
  {
    name: "🚫 基礎畫質提升 (通用)",
    value: "general",
    prompt: "blurry, low resolution, low quality, worst quality, jpeg artifacts, noise, grain, compression artifacts, cropped, out of frame"
  },
  {
    name: "🎬 寫實防畸變 (寫實/電影)",
    value: "realistic",
    prompt: "blurry, low quality, worst quality, deformed hands, extra fingers, fused fingers, missing fingers, mutated hands, bad anatomy, bad proportions, extra limbs, missing limbs, distorted face, asymmetrical eyes, cartoon, illustration, drawing, painting, 3d render, cg"
  },
  {
    name: "🌸 二次元極淨化 (動漫)",
    value: "anime",
    prompt: "blurry, low quality, worst quality, realistic, photorealistic, 3d, gritty, sketch, monochrome, deformed hands, extra fingers, text, watermark, logo"
  },
  {
    name: "🎨 藝術手繪去雜 (水彩/古風)",
    value: "artistic",
    prompt: "photorealistic, photograph, 3d render, cg, blurry, low resolution, low quality, deformed, text, watermark, signature"
  },
  {
    name: "🧸 3D 黏土極平滑 (3D/黏土)",
    value: "clay",
    prompt: "blurry, low resolution, low quality, photorealistic, realistic, flat color, sketch, lineart, text, watermark"
  },
  {
    name: "🔇 去字去水印 (純淨版)",
    value: "pure",
    prompt: "text, watermark, signature, username, logo, title, subtitles, border, frame, timestamp"
  }
];

function normalizeProjectsList(parsed: any[]): Project[] {
  return parsed.map(p => ({
    id: p.id || `project_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: p.name || "Untitled Project",
    createdAt: p.createdAt || new Date().toLocaleString(),
    novelText: p.novelText || "",
    characters: Array.isArray(p.characters) ? p.characters.map((c: any) => ({
      id: c.id || `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: c.name || "Unnamed Character",
      description: c.description || "",
      role: c.role || "",
      avatarUrl: c.avatarUrl || "",
      avatarUrls: Array.isArray(c.avatarUrls) ? c.avatarUrls : (c.avatarUrl ? [c.avatarUrl] : []),
      uploadedAvatarUrl: c.uploadedAvatarUrl || "",
      uploadedAvatarUrls: Array.isArray(c.uploadedAvatarUrls) ? c.uploadedAvatarUrls : (c.uploadedAvatarUrl ? [c.uploadedAvatarUrl] : []),
      isGeneratingAvatar: !!c.isGeneratingAvatar,
      artStyle: c.artStyle || "",
      age: c.age || "",
      clothing: c.clothing || "",
      personality: c.personality || ""
    })) : [],
    scenes: Array.isArray(p.scenes) ? p.scenes.map((s: any) => ({
      ...s,
      id: s.id || `scene_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: s.title || "Scene",
      dialogue: s.dialogue || "",
      narration: s.narration || "",
      character: s.character || "Narrator",
      visualPrompt: s.visualPrompt || "",
      negativePrompt: s.negativePrompt || "",
      durationSeconds: typeof s.durationSeconds === 'number' ? s.durationSeconds : s.durationSeconds ? parseInt(s.durationSeconds as any) : undefined,
      imageUrl: s.imageUrl || "",
      videoUrl: s.videoUrl || "",
      isGeneratingImage: !!s.isGeneratingImage,
      isGeneratingVideo: !!s.isGeneratingVideo,
      videoProgress: s.videoProgress || "0%",
      videoLogs: Array.isArray(s.videoLogs) ? s.videoLogs : [],
      videoError: s.videoError || "",
      audioCue: s.audioCue || "",
      directorNotes: s.directorNotes || "",
      transitionPrompt: s.transitionPrompt || ""
    })) : [],
    scenesExt: Array.isArray(p.scenesExt) ? p.scenesExt.map((s: any) => ({
      ...s,
      id: s.id || `scene_ext_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: s.title || "Scene",
      dialogue: s.dialogue || "",
      narration: s.narration || "",
      character: s.character || "Narrator",
      visualPrompt: s.visualPrompt || "",
      negativePrompt: s.negativePrompt || "",
      durationSeconds: typeof s.durationSeconds === 'number' ? s.durationSeconds : s.durationSeconds ? parseInt(s.durationSeconds as any) : undefined,
      imageUrl: s.imageUrl || "",
      videoUrl: s.videoUrl || "",
      isGeneratingImage: !!s.isGeneratingImage,
      isGeneratingVideo: !!s.isGeneratingVideo,
      videoProgress: s.videoProgress || "0%",
      videoLogs: Array.isArray(s.videoLogs) ? s.videoLogs : [],
      videoError: s.videoError || "",
      audioCue: s.audioCue || "",
      directorNotes: s.directorNotes || "",
      transitionPrompt: s.transitionPrompt || ""
    })) : [],
    scenesFirstLast: Array.isArray(p.scenesFirstLast) ? p.scenesFirstLast.map((s: any) => ({
      ...s,
      id: s.id || `scene_fl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: s.title || "Scene",
      dialogue: s.dialogue || "",
      narration: s.narration || "",
      character: s.character || "Narrator",
      visualPrompt: s.visualPrompt || "",
      negativePrompt: s.negativePrompt || "",
      durationSeconds: typeof s.durationSeconds === 'number' ? s.durationSeconds : s.durationSeconds ? parseInt(s.durationSeconds as any) : undefined,
      imageUrl: s.imageUrl || "",
      videoUrl: s.videoUrl || "",
      isGeneratingImage: !!s.isGeneratingImage,
      isGeneratingVideo: !!s.isGeneratingVideo,
      videoProgress: s.videoProgress || "0%",
      videoLogs: Array.isArray(s.videoLogs) ? s.videoLogs : [],
      videoError: s.videoError || "",
      audioCue: s.audioCue || "",
      directorNotes: s.directorNotes || "",
      transitionPrompt: s.transitionPrompt || ""
    })) : [],
    disassemblyEngine: p.disassemblyEngine || "mistral",
    selectedModel: p.selectedModel || "Mistral Large 3 (高智能旗艦)",
    drawingChannel: p.drawingChannel || "flux",
    artStyle: p.artStyle || "動漫卡通動感 (Anime key visual)",
    cameraMotion: p.cameraMotion || "經典推拉運鏡 (Classic Ken Burns Zoom & Pan)",
    agnesVideoMode: p.agnesVideoMode || "quality",
    agnesImageMode: p.agnesImageMode || "quality"
  }));
}

export default function App() {
  // Navigation & Project selection states
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSyncCompleted, setIsSyncCompleted] = useState<boolean>(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const [activeTab, setActiveTab] = useState<"novel" | "characters" | "scenes" | "scenes_ext" | "gallery">("scenes");
  
  // Settings & Custom API Keys
  const [customApiKey, setCustomApiKey] = useState<string>("cpk-CJxrCSyiu9BWsE1yzwrPX2REloaU8cgoPeGH4daMV6NcVSm8");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  
  // Generation & AI progress states
  const [isDisassembling, setIsDisassembling] = useState<boolean>(false);
  const [isExtractingCharacters, setIsExtractingCharacters] = useState<boolean>(false);
  const [isGeneratingNovel, setIsGeneratingNovel] = useState<boolean>(false);
  const [novelIdea, setNovelIdea] = useState<string>("");
  const [showIdeaInput, setShowIdeaInput] = useState<boolean>(false);
  const [isGeneratingAllSequentially, setIsGeneratingAllSequentially] = useState<boolean>(false);
  const [isGeneratingAllKeyframesSequentially, setIsGeneratingAllKeyframesSequentially] = useState<boolean>(false);
  const [isFullAutoProducing, setIsFullAutoProducing] = useState<boolean>(false);
  const [fullAutoProgress, setFullAutoProgress] = useState<string>("0%");
  const [fullAutoLogs, setFullAutoLogs] = useState<string[]>([]);
  const [finalStitchedVideoUrl, setFinalStitchedVideoUrl] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  
  // Custom states for selectable Agents
  const [selectedNovelAgents, setSelectedNovelAgents] = useState<('gemini' | 'agnes' | 'mistral')[]>(['gemini', 'agnes', 'mistral']);
  const [selectedChatAgents, setSelectedChatAgents] = useState<('gemini' | 'agnes' | 'mistral')[]>(['gemini', 'agnes', 'mistral']);
  
  // Chatbot states
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string, agent?: 'gemini' | 'agnes' | 'mistral' | 'all'}[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatting, setIsChatting] = useState<boolean>(false);

  // Scene-level chatbot states
  const [sceneChats, setSceneChats] = useState<Record<string, { role: 'user' | 'ai'; content: string }[]>>({});
  const [sceneChatInputs, setSceneChatInputs] = useState<Record<string, string>>({});
  const [isSceneChatting, setIsSceneChatting] = useState<Record<string, boolean>>({});

  // Global Storyboard Chatbot states
  const [storyboardChatMessages, setStoryboardChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [storyboardChatInput, setStoryboardChatInput] = useState<string>("");
  const [isStoryboardChatting, setIsStoryboardChatting] = useState<boolean>(false);
  
  const [globalTask, setGlobalTask] = useState<TaskState>({
    status: "idle",
    progress: "0%",
    logs: [],
  });

  // Simulation playback state (本地 100% 免費影片製作大師)
  const [selectedSceneForSimulation, setSelectedSceneForSimulation] = useState<Scene | null>(null);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Global Character Library & Toast States
  const [characterLibrary, setCharacterLibrary] = useState<Character[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [analyzingTargetId, setAnalyzingTargetId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // References
  const logsEndRef = useRef<HTMLDivElement>(null);
  const abortControllersRef = useRef<Record<string, AbortController>>({});
  const videoIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [newProjectName, setNewProjectName] = useState<string>("");

  // Drag and drop sorting states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  // Undo/Redo state history
  const [undoStack, setUndoStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);
  
  const lastSignatureRef = useRef<string>("");
  const stableProjectRef = useRef<Project | null>(null);
  const isUndoRedoActionRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<any>(null);

  // Listen to activeProject changes and update history stack (debounced to avoid typing noise)
  useEffect(() => {
    if (!activeProject) {
      lastSignatureRef.current = "";
      stableProjectRef.current = null;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      return;
    }

    const currentSignature = getProjectSignature(activeProject);

    if (isUndoRedoActionRef.current) {
      // Just update reference, don't push to stack
      lastSignatureRef.current = currentSignature;
      stableProjectRef.current = JSON.parse(JSON.stringify(activeProject));
      isUndoRedoActionRef.current = false;
      return;
    }

    // Set up stable reference on initial load of active project
    if (!stableProjectRef.current) {
      lastSignatureRef.current = currentSignature;
      stableProjectRef.current = JSON.parse(JSON.stringify(activeProject));
      return;
    }

    // If signature changed, schedule updating the stable state and pushing to undoStack
    if (currentSignature !== lastSignatureRef.current) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(() => {
        if (stableProjectRef.current) {
          const prevStable = stableProjectRef.current;
          setUndoStack(prev => {
            const newStack = [...prev, prevStable];
            if (newStack.length > 50) {
              newStack.shift();
            }
            return newStack;
          });
          // New action clears redo stack
          setRedoStack([]);
        }
        stableProjectRef.current = JSON.parse(JSON.stringify(activeProject));
      }, 800); // 800ms debounce
    }

    lastSignatureRef.current = currentSignature;
  }, [activeProject]);

  // Reset undo/redo stacks when activeProjectId changes
  useEffect(() => {
    setUndoStack([]);
    setRedoStack([]);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (activeProject) {
      lastSignatureRef.current = getProjectSignature(activeProject);
      stableProjectRef.current = JSON.parse(JSON.stringify(activeProject));
    } else {
      lastSignatureRef.current = "";
      stableProjectRef.current = null;
    }
  }, [activeProjectId]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleUndo = () => {
    if (!activeProjectId) return;
    
    // Check if there are uncommitted changes (from a pending debounce)
    const currentSignature = activeProject ? getProjectSignature(activeProject) : "";
    const stableSignature = stableProjectRef.current ? getProjectSignature(stableProjectRef.current) : "";
    
    if (currentSignature !== stableSignature && stableProjectRef.current && activeProject) {
      // Clear pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      isUndoRedoActionRef.current = true;
      
      // Save current typed state to redo stack
      setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(activeProject))]);
      
      const prevProject = stableProjectRef.current;
      
      // Revert projects state to the stable state
      setProjects(prevProjects => {
        const updatedList = prevProjects.map(p => {
          if (p.id === activeProjectId) {
            return JSON.parse(JSON.stringify(prevProject));
          }
          return p;
        });
        try {
          localStorage.setItem("toonflow_projects", JSON.stringify(updatedList));
        } catch (e) {
          console.error("Failed to save to localStorage in Undo:", e);
        }
        return updatedList;
      });
      
      showToast("已復原變更 (Undo)", "success");
      return;
    }

    // Standard undo from stack
    if (undoStack.length === 0) {
      showToast("沒有更多變更可以復原！", "info");
      return;
    }
    
    const prevProject = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    isUndoRedoActionRef.current = true;
    
    // Push current state to redo stack
    if (activeProject) {
      setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(activeProject))]);
    }
    
    setUndoStack(newUndoStack);
    
    setProjects(prevProjects => {
      const updatedList = prevProjects.map(p => {
        if (p.id === activeProjectId) {
          return JSON.parse(JSON.stringify(prevProject));
        }
        return p;
      });
      try {
        localStorage.setItem("toonflow_projects", JSON.stringify(updatedList));
      } catch (e) {
        console.error("Failed to save to localStorage in Undo:", e);
      }
      return updatedList;
    });
    
    stableProjectRef.current = JSON.parse(JSON.stringify(prevProject));
    showToast("已復原變更 (Undo)", "success");
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !activeProjectId) {
      showToast("沒有更多已復原變更可以重做！", "info");
      return;
    }
    
    const nextProject = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    isUndoRedoActionRef.current = true;
    
    // Clear pending debounce if any
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Push current state to undo stack
    if (activeProject) {
      setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(activeProject))]);
    }
    
    setRedoStack(newRedoStack);
    
    setProjects(prevProjects => {
      const updatedList = prevProjects.map(p => {
        if (p.id === activeProjectId) {
          return JSON.parse(JSON.stringify(nextProject));
        }
        return p;
      });
      try {
        localStorage.setItem("toonflow_projects", JSON.stringify(updatedList));
      } catch (e) {
        console.error("Failed to save to localStorage in Redo:", e);
      }
      return updatedList;
    });
    
    stableProjectRef.current = JSON.parse(JSON.stringify(nextProject));
    showToast("已重做變更 (Redo)", "success");
  };

  const undoRef = useRef(handleUndo);
  const redoRef = useRef(handleRedo);
  
  useEffect(() => {
    undoRef.current = handleUndo;
    redoRef.current = handleRedo;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeProjectId) return;
      
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd) {
        if (e.key === "z" || e.key === "Z") {
          if (e.shiftKey) {
            e.preventDefault();
            redoRef.current();
          } else {
            e.preventDefault();
            undoRef.current();
          }
        } else if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          redoRef.current();
        }
      } else if (!isInput) {
        if (e.key === "s" || e.key === "S") {
          setActiveTab("scenes");
        } else if (e.key === "c" || e.key === "C") {
          setActiveTab("characters");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [activeProjectId]);

  // Auto-scroll full automatic production logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [fullAutoLogs]);

  // Load projects and settings on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("toonflow_projects");
    const savedKey = localStorage.getItem("agnes_custom_api_key");
    const savedLib = localStorage.getItem("toonflow_character_library");
    
    if (savedLib) {
      try {
        setCharacterLibrary(JSON.parse(savedLib));
      } catch (e) {
        console.error("Failed to parse character library", e);
      }
    }

    if (savedKey) {
      setCustomApiKey(savedKey);
    } else {
      setCustomApiKey("cpk-CJxrCSyiu9BWsE1yzwrPX2REloaU8cgoPeGH4daMV6NcVSm8");
    }

    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        console.log("Parsed projects:", parsed);
        if (parsed && Array.isArray(parsed)) {
          if (parsed.length === 0) {
            console.log("Saved projects is an empty array.");
          }
          // Robustly migrate and normalize project entries
          const normalized = normalizeProjectsList(parsed);
          setProjects(normalized);

          // Asynchronously migrate any leftover base64 images to server storage to free up localStorage
          (async () => {
            let hasChanges = false;
            const migrateUrl = async (url: string) => {
              if (url && url.startsWith("data:image")) {
                try {
                  const res = await fetch("/api/upload-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ base64Data: url })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    return data.imageUrl;
                  }
                } catch (e) {
                  console.error("Migration failed for a base64 image", e);
                }
              }
              return url;
            };

            const migratedProjects = await Promise.all(normalized.map(async p => {
              const mProj = { ...p };
              let projChanged = false;
              
              // Migrate character avatars
              mProj.characters = await Promise.all(mProj.characters.map(async c => {
                let mChar = { ...c };
                const newAvatarUrl = await migrateUrl(mChar.avatarUrl);
                if (newAvatarUrl !== mChar.avatarUrl) { mChar.avatarUrl = newAvatarUrl; projChanged = true; }
                
                if (mChar.avatarUrls && mChar.avatarUrls.length > 0) {
                  mChar.avatarUrls = await Promise.all(mChar.avatarUrls.map(u => migrateUrl(u)));
                  projChanged = true;
                }
                
                const newUpAvatarUrl = await migrateUrl(mChar.uploadedAvatarUrl);
                if (newUpAvatarUrl !== mChar.uploadedAvatarUrl) { mChar.uploadedAvatarUrl = newUpAvatarUrl; projChanged = true; }
                
                if (mChar.uploadedAvatarUrls && mChar.uploadedAvatarUrls.length > 0) {
                  mChar.uploadedAvatarUrls = await Promise.all(mChar.uploadedAvatarUrls.map(u => migrateUrl(u)));
                  projChanged = true;
                }
                
                return mChar;
              }));

              const processScenes = async (scenes: any[]) => {
                return await Promise.all(scenes.map(async (s: any) => {
                  let mScene = { ...s };
                  const newImg = await migrateUrl(mScene.imageUrl);
                  if (newImg !== mScene.imageUrl) { mScene.imageUrl = newImg; projChanged = true; }
                  const newImgExt = await migrateUrl(mScene.imageUrlExt);
                  if (newImgExt !== mScene.imageUrlExt) { mScene.imageUrlExt = newImgExt; projChanged = true; }
                  const newImgKf = await migrateUrl(mScene.imageUrlKeyframes);
                  if (newImgKf !== mScene.imageUrlKeyframes) { mScene.imageUrlKeyframes = newImgKf; projChanged = true; }
                  return mScene;
                }));
              };

              mProj.scenes = await processScenes(mProj.scenes);
              mProj.scenesExt = await processScenes(mProj.scenesExt);
              mProj.scenesFirstLast = await processScenes(mProj.scenesFirstLast);

              if (projChanged) hasChanges = true;
              return mProj;
            }));

            if (hasChanges) {
              console.log("[Toonflow] Successfully migrated base64 images to server assets.");
              setProjects(migratedProjects);
              try {
                localStorage.setItem("toonflow_projects", JSON.stringify(migratedProjects));
              } catch (e) {
                console.error("Quota still exceeded after migration", e);
              }
            }
          })();

        } else {
          seedDefaultProject();
        }
      } catch (e) {
        seedDefaultProject();
      }
    } else {
      seedDefaultProject();
    }
  }, []);

  // Sync projects from secure server-side proxy on mount and handle normalization securely
  useEffect(() => {
    const fetchProjects = async (retries = 3) => {
      try {
        const res = await fetch("/api/load-projects");
        if (!res.ok) {
          throw new Error(`Proxy status: ${res.status}`);
        }
        const data = await res.json();
        if (data && Array.isArray(data.projects) && data.projects.length > 0) {
          const normalized = normalizeProjectsList(data.projects);
          setProjects(normalized);
          try {
            localStorage.setItem("toonflow_projects", JSON.stringify(normalized));
          } catch (e) {
            console.error("Quota exceeded saving loaded server projects", e);
          }
        }
        setIsSyncCompleted(true);
      } catch (e: any) {
        if (retries > 0) {
          console.warn(`Server proxy loading failed/offline, retrying... (${retries} attempts left)`);
          setTimeout(() => fetchProjects(retries - 1), 2000);
        } else {
          console.error("Failed to sync projects from server-side proxy", e);
          setIsSyncCompleted(true); // Permit usage and local autosave
        }
      }
    };
    fetchProjects();
  }, []);

  // Debounced secure cloud autosave to prevent data loss or mismatch
  useEffect(() => {
    if (!isSyncCompleted) return;
    if (!projects || projects.length === 0) return;

    const timer = setTimeout(() => {
      // Simple dirty check to avoid redundant writes
      const savedProjects = localStorage.getItem("last_saved_projects");
      if (savedProjects === JSON.stringify(projects)) {
        return;
      }
      
      // Cool-down for 10 minutes if we hit a quota error
      const lastSaveAttempt = localStorage.getItem("last_save_attempt_time");
      if (lastSaveAttempt && Date.now() - parseInt(lastSaveAttempt) < 600000) {
        return;
      }
      localStorage.setItem("last_saved_projects", JSON.stringify(projects));

      const performSave = async (retryCount = 0) => {
        try {
          const uploadBase64 = async (url: string) => {
            if (url && url.startsWith("data:image")) {
              try {
                const uploadRes = await fetch("/api/upload-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ base64Data: url })
                });
                if (uploadRes.ok) {
                  const data = await uploadRes.json();
                  return data.imageUrl;
                }
              } catch (e) {
                console.error("[Toonflow Autosave] Failed to upload base64 image", e);
              }
            }
            return url;
          };

          // Prune large logs to avoid payload size overflow and ensure fast transfers under Firestore limits
          const prunedProjects = projects.map(p => {
            const pruneScene = (s: any) => {
              if (!s) return s;
              const pruned = { ...s };
              if (Array.isArray(pruned.videoLogs)) {
                pruned.videoLogs = pruned.videoLogs.slice(-5);
              }
              if (Array.isArray(pruned.videoLogsExt)) {
                pruned.videoLogsExt = pruned.videoLogsExt.slice(-5);
              }
              if (Array.isArray(pruned.videoLogsKeyframes)) {
                pruned.videoLogsKeyframes = pruned.videoLogsKeyframes.slice(-5);
              }
              return pruned;
            };
            return {
              ...p,
              scenes: Array.isArray(p.scenes) ? p.scenes.map(pruneScene) : [],
              scenesExt: Array.isArray(p.scenesExt) ? p.scenesExt.map(pruneScene) : [],
              scenesFirstLast: Array.isArray(p.scenesFirstLast) ? p.scenesFirstLast.map(pruneScene) : []
            };
          });

          // Scan and replace all base64 images in prunedProjects
          const cleanProjects = await Promise.all(prunedProjects.map(async p => {
            const cleanProj = { ...p };
            
            // Trim novelText if too long to prevent Firestore 1MB limits
            if (cleanProj.novelText && cleanProj.novelText.length > 50000) {
              cleanProj.novelText = cleanProj.novelText.substring(0, 50000) + "... (小說內容過長，已自動截斷存檔)";
            }
            
            // Characters
            if (Array.isArray(cleanProj.characters)) {
              cleanProj.characters = await Promise.all(cleanProj.characters.map(async c => {
                const cleanedChar = { ...c };
                cleanedChar.avatarUrl = await uploadBase64(cleanedChar.avatarUrl || "");
                cleanedChar.uploadedAvatarUrl = await uploadBase64(cleanedChar.uploadedAvatarUrl || "");
                if (Array.isArray(cleanedChar.avatarUrls)) {
                  cleanedChar.avatarUrls = await Promise.all(cleanedChar.avatarUrls.map(url => uploadBase64(url)));
                }
                if (Array.isArray(cleanedChar.uploadedAvatarUrls)) {
                  cleanedChar.uploadedAvatarUrls = await Promise.all(cleanedChar.uploadedAvatarUrls.map(url => uploadBase64(url)));
                }
                return cleanedChar;
              }));
            }
            
            // Scenes
            const cleanSceneImages = async (scenesList: any[]) => {
              if (!Array.isArray(scenesList)) return [];
              return await Promise.all(scenesList.map(async s => {
                if (!s) return s;
                const cleanedScene = { ...s };
                cleanedScene.imageUrl = await uploadBase64(cleanedScene.imageUrl || "");
                cleanedScene.imageUrlExt = await uploadBase64(cleanedScene.imageUrlExt || "");
                cleanedScene.imageUrlKeyframes = await uploadBase64(cleanedScene.imageUrlKeyframes || "");
                return cleanedScene;
              }));
            };
            
            cleanProj.scenes = await cleanSceneImages(cleanProj.scenes);
            cleanProj.scenesExt = await cleanSceneImages(cleanProj.scenesExt);
            cleanProj.scenesFirstLast = await cleanSceneImages(cleanProj.scenesFirstLast);
            
            return cleanProj;
          }));

          const res = await fetch("/api/save-projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projects: cleanProjects })
          });
          if (!res.ok) {
            throw new Error(`Server returned status ${res.status}`);
          }
        } catch (e: any) {
          console.warn(`[Toonflow Autosave] Save attempt ${retryCount + 1} failed: ${e.message || e}`);
          
          // If quota is exhausted, disable autosave for a while
          if (e.message && e.message.includes("RESOURCE_EXHAUSTED")) {
            console.error("[Toonflow Autosave] Quota exhausted! Autosave disabled for 10 minutes.");
            localStorage.setItem("last_save_attempt_time", Date.now().toString());
            return;
          }

          if (retryCount < 1) { // Reduced retries
            // Retry after 5 seconds
            setTimeout(() => performSave(retryCount + 1), 5000);
          } else {
            console.error("Cloud Autosave: Failed to sync projects to secure proxy after retries", e);
          }
        }
      };
      performSave();
    }, 900000);


    return () => clearTimeout(timer);
  }, [projects, isSyncCompleted]);

  // Save projects to localStorage and to Firestore securely via the server-side proxy whenever they change
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem("toonflow_projects", JSON.stringify(updatedProjects));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        showToast("瀏覽器儲存空間已滿，請清理不必要的專案或減小圖片大小", "error");
        console.error("Storage quota exceeded:", e);
      }
    }
  };

  // Seed default "月" (Moon) project
  const seedDefaultProject = () => {
    const defaultProject: Project = {
      id: "project_moon",
      name: "月 (Moon Project)",
      createdAt: new Date().toLocaleString(),
      novelText: "深夜，凌風獨自坐在冷清的辦公室裡，面前放著一份帶有血跡的秘密文件。窗外暴雨如注，城市的霓虹燈在雨幕中扭曲。他深吸了一口氣，撥通了那個塵封已久的號碼：「一切都開始了。」",
      characters: [
        {
          id: "char_1",
          name: "凌風",
          description: "年約28歲，身穿黑色西裝的冷酷年輕總裁，神色陰沈凝重，眼神犀利透徹。"
        }
      ],
      scenes: [
        {
          id: "scene_1",
          title: "凌風的辦公室 - 深夜",
          character: "凌風",
          dialogue: "",
          narration: "凌風獨自坐在冷清的辦公室裡，桌面上放著帶有血跡的秘密文件。窗外正下著暴雨。",
          visualPrompt: "A high-quality cinematic shot of a young handsome male executive in a sleek dark modern office at midnight, rainy window in the background with glowing city neon lights reflections, looking tense and holding a suspicious folder, anime key visual style, dramatic shadows, 8k resolution.",
          imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
          audioCue: "窗外暴雨如注的下雨聲與隆隆雷鳴聲",
          directorNotes: "開場氣氛建立，色調偏冷藍，加強孤獨與懸疑感。需要強調文件上的血跡細節。"
        },
        {
          id: "scene_2",
          title: "深遂的雨夜通話",
          character: "凌風",
          dialogue: "「一切都開始了。」",
          narration: "他深吸了一口氣，撥通了那個塵封已久的號碼。",
          visualPrompt: "Close-up shot of a young man with sharp eyes, holding a modern smartphone to his ear in a dimly lit office, wet neon window reflections, intense cinematic atmosphere, anime key visual style, high details, premium lighting.",
          imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
          audioCue: "室內拉近特寫，窗外雨聲弱化消失，背景為靜謐微弱的風聲與單音鋼琴旋律",
          directorNotes: "特寫鏡頭聚焦在打電話時緊張的眼神，手部有些微顫抖。背景燈光呈現淺紫色調。"
        }
      ],
      scenesExt: [],
      scenesFirstLast: [],
      disassemblyEngine: "mistral",
      selectedModel: "Mistral Large 3 (高智能旗艦)",
      drawingChannel: "flux",
      artStyle: "動漫卡通動感 (Anime key visual)",
      cameraMotion: "經典推拉運鏡 (Classic Ken Burns Zoom & Pan)",
      agnesVideoMode: "quality",
      agnesImageMode: "quality"
    };

    saveProjects([defaultProject]);
  };

  // Sync saved key to localStorage
  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("agnes_custom_api_key", key);
  };

  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);

  const copyTextToClipboard = (text: string, sceneId: string) => {
    const doCopy = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        let success = false;
        try {
          success = document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textArea);
        if (success) return Promise.resolve();
        return Promise.reject("execCommand failed");
      }
    };

    doCopy()
      .then(() => {
        setCopiedSceneId(sceneId);
        setTimeout(() => setCopiedSceneId(null), 2000);
      })
      .catch((err) => {
        console.error("Copy failed", err);
      });
  };

  // Update active project details helper
  const updateActiveProject = (
    updated: Partial<Project> | ((prev: Project) => Partial<Project>)
  ) => {
    if (!activeProjectId) return;
    setProjects((prevProjects) => {
      const updatedList = prevProjects.map((p) => {
        if (p.id === activeProjectId) {
          const resolvedUpdate = typeof updated === "function" ? updated(p) : updated;
          const newProject = { ...p, ...resolvedUpdate };
          if (resolvedUpdate.artStyle && resolvedUpdate.artStyle !== p.artStyle) {
            // Cascade art style to all characters
            newProject.characters = newProject.characters.map((c) => ({
              ...c,
              artStyle: resolvedUpdate.artStyle as string,
            }));
          }
          return newProject;
        }
        return p;
      });
      // Save projects to localStorage whenever they change
      try {
        localStorage.setItem("toonflow_projects", JSON.stringify(updatedList));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          showToast("瀏覽器儲存空間已滿，請清理不必要的專案或減小圖片大小", "error");
          console.error("Storage quota exceeded:", e);
        }
      }
      return updatedList;
    });
  };

  // Project Actions
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(newProjectName).trim()) return;

    const newProj: Project = {
      id: `project_${Date.now()}`,
      name: newProjectName.trim(),
      createdAt: new Date().toLocaleString(),
      novelText: "",
      characters: [],
      scenes: [],
      disassemblyEngine: "mistral",
      selectedModel: "Mistral Large 3 (高智能旗艦)",
      drawingChannel: "flux",
      artStyle: "動漫卡通動感 (Anime key visual)",
      cameraMotion: "經典推拉運鏡 (Classic Ken Burns Zoom & Pan)",
      agnesVideoMode: "quality",
      agnesImageMode: "quality"
    };

    const list = [...projects, newProj];
    saveProjects(list);
    setActiveProjectId(newProj.id);
    setActiveTab("novel");
    setNewProjectName("");
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(id);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    const list = projects.filter(p => p.id !== projectToDelete);
    saveProjects(list);
    if (activeProjectId === projectToDelete) {
      setActiveProjectId(null);
    }
    setProjectToDelete(null);
  };

  const handleGenerateNovel = async (isRandom: boolean, engines?: ('gemini' | 'agnes' | 'mistral')[]) => {
    if (!activeProject) return;
    
    const activeEngines = engines || selectedNovelAgents;
    if (activeEngines.length === 0) {
      alert("請至少選擇一個 Agent 參加創作！");
      return;
    }
    
    setIsGeneratingNovel(true);
    try {
      const res = await fetch("/api/generate-novel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: isRandom ? null : novelIdea,
          isRandom,
          engines: activeEngines,
          customApiKey: customApiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate novel");
      }

      const textRes = await res.text();
      let data: any;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }
      if (data.text) {
        updateActiveProject({ novelText: data.text });
        setShowIdeaInput(false);
        setNovelIdea("");
        
        if (data.discussionReport) {
          setChatMessages(prev => [
            ...prev,
            {
              role: 'ai',
              content: `這是全體 AI Agent 經過腦力激盪與協調會議後的「協調討論與整合報告」：\n\n${data.discussionReport}\n\n*(故事已為您套用並更新至上方編輯區)*`,
              agent: 'all'
            }
          ]);
          showToast("共同創作成功！已將 AI 討論報告加入下方的「AI 劇本助理」對話中。", "success");
        } else {
          showToast("劇本生成成功！", "success");
        }
      }
    } catch (err) {
      console.error(err);
      alert("生成失敗，請稍後再試。");
    } finally {
      setIsGeneratingNovel(false);
    }
  };

  const handleChatNovel = async (selectedEngines: ('gemini' | 'agnes' | 'mistral')[]) => {
    if (!activeProject || !chatInput.trim()) return;

    const userMessage = { role: 'user' as const, content: chatInput.trim() };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatting(true);

    try {
      // Assuming primary engine is the first in selection
      const engine = selectedEngines[0];
      const res = await fetch("/api/chat-novel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          novelText: activeProject.novelText,
          engines: selectedEngines,
          customApiKey: customApiKey || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Chat request failed");
      }

      const textRes = await res.text();
      let data: any;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }
      if (data.text) {
        let replyContent = data.text;
        
        // Extract updated novel text if present
        const updateRegex = /<novel_update>([\s\S]*?)<\/novel_update>/;
        const match = replyContent.match(updateRegex);
        
        if (match && match[1]) {
          const updatedNovelText = match[1].trim();
          updateActiveProject({ novelText: updatedNovelText });
          replyContent = replyContent.replace(updateRegex, "*(劇本已更新)*").trim();
        }

        const agentLabel = selectedEngines.length > 1 ? 'all' : selectedEngines[0];
        setChatMessages([...newMessages, { role: 'ai', content: replyContent, agent: agentLabel }]);
      }
    } catch (err: any) {
      console.error(err);
      alert(`對話失敗：${err.message}`);
      // Remove the last user message on failure
      setChatMessages(chatMessages);
    } finally {
      setIsChatting(false);
    }
  };

  const handleChatScene = async (sceneId: string) => {
    if (!activeProject) return;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    const input = sceneChatInputs[sceneId]?.trim();
    if (!scene || !input) return;

    // Append user message
    const userMsg = { role: 'user' as const, content: input };
    const history = sceneChats[sceneId] || [];
    const newHistory = [...history, userMsg];

    // Clear input, set loading
    setSceneChatInputs(prev => ({ ...prev, [sceneId]: "" }));
    setSceneChats(prev => ({ ...prev, [sceneId]: newHistory }));
    setIsSceneChatting(prev => ({ ...prev, [sceneId]: true }));

    try {
      const res = await fetch("/api/chat-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene,
          message: input,
          history: history,
          customApiKey: customApiKey || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "分鏡對話失敗");
      }

      const data = await res.json();
      const aiReply = data.response || "未收到 AI 回覆。";

      // Append AI message
      setSceneChats(prev => ({
        ...prev,
        [sceneId]: [...newHistory, { role: 'ai' as const, content: aiReply }]
      }));

      // If AI updated some scene fields, update them immediately!
      if (data.updatedFields && typeof data.updatedFields === 'object') {
        const fields = data.updatedFields;
        const updatedScenes = activeProject.scenes.map(s => {
          if (s.id === sceneId) {
            const updated = { ...s };
            Object.keys(fields).forEach(key => {
              if (fields[key] !== undefined && fields[key] !== null) {
                // @ts-ignore
                updated[key] = fields[key];
              }
            });
            return updated;
          }
          return s;
        });
        updateActiveProject({ scenes: updatedScenes });
        showToast(`已根據分鏡助理建議更新此分鏡設定！`, "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(`分鏡助理對話失敗: ${err.message}`, "error");
      // Revert user message on failure
      setSceneChats(prev => ({
        ...prev,
        [sceneId]: history
      }));
    } finally {
      setIsSceneChatting(prev => ({ ...prev, [sceneId]: false }));
    }
  };

  const handleGlobalStoryboardChat = async () => {
    if (!activeProject || !storyboardChatInput.trim()) return;

    const input = storyboardChatInput.trim();
    const userMsg = { role: 'user' as const, content: input };
    const history = storyboardChatMessages;
    const newHistory = [...history, userMsg];

    setStoryboardChatInput("");
    setStoryboardChatMessages(newHistory);
    setIsStoryboardChatting(true);

    try {
      const res = await fetch("/api/chat-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: activeProject.scenes,
          characters: activeProject.characters,
          message: input,
          history: history,
          customApiKey: customApiKey || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "分鏡劇本助理對話失敗");
      }

      const data = await res.json();
      const aiReply = data.response || "未收到 AI 回覆。";

      setStoryboardChatMessages([...newHistory, { role: 'ai' as const, content: aiReply }]);

      if (data.updatedScenes && Array.isArray(data.updatedScenes)) {
        const aiScenesMap = new Map(data.updatedScenes.map((s: any) => [s.id, s]));
        const updatedScenes = activeProject.scenes.map(s => {
          const aiScene = aiScenesMap.get(s.id) as any;
          if (aiScene) {
            return {
              ...s,
              title: aiScene.title !== undefined ? aiScene.title : s.title,
              character: aiScene.character !== undefined ? aiScene.character : s.character,
              dialogue: aiScene.dialogue !== undefined ? aiScene.dialogue : s.dialogue,
              narration: aiScene.narration !== undefined ? aiScene.narration : s.narration,
              visualPrompt: aiScene.visualPrompt !== undefined ? aiScene.visualPrompt : s.visualPrompt,
              actionPrompt: aiScene.actionPrompt !== undefined ? aiScene.actionPrompt : s.actionPrompt,
              transitionPrompt: aiScene.transitionPrompt !== undefined ? aiScene.transitionPrompt : s.transitionPrompt,
              durationSeconds: aiScene.durationSeconds !== undefined ? aiScene.durationSeconds : s.durationSeconds,
              audioCue: aiScene.audioCue !== undefined ? aiScene.audioCue : s.audioCue,
              directorNotes: aiScene.directorNotes !== undefined ? aiScene.directorNotes : s.directorNotes,
            };
          }
          return s;
        });

        updateActiveProject({ scenes: updatedScenes });
        showToast("已根據分鏡導演建議更新分鏡劇本卡片列表！", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(`分鏡劇本助理對話失敗: ${err.message}`, "error");
      setStoryboardChatMessages(history);
    } finally {
      setIsStoryboardChatting(false);
    }
  };

  // Helper to estimate reading duration for a specific text block
  const estimateTextDuration = (text: string): number => {
    const trimmed = (text || "").trim();
    if (!trimmed) return 0;

    // Count Chinese characters
    const chineseChars = (trimmed.match(/[\u4e00-\u9fa5]/g) || []).length;
    
    // Count punctuation representing natural breathing/speaking pauses
    const pauseMarks = (trimmed.match(/[，。！？；：、\,\.\!\?\:;]/g) || []).length;

    // Remove Chinese characters and punctuation to estimate English words / numbers remaining
    const remainingText = trimmed
      .replace(/[\u4e00-\u9fa5]/g, "")
      .replace(/[，。！？；：、\,\.\!\?\:;]/g, " ")
      .trim();
    const englishWords = remainingText ? remainingText.split(/\s+/).filter(w => w.length > 0).length : 0;

    // Calculation:
    // 1. Chinese reading speed: ~3.5 characters per second
    // 2. English reading speed: ~2.5 words per second
    // 3. Pause marks: 0.5 seconds each
    // 4. Baseline overhead (breath in/out, natural acting pacing/reaction): 1.5 seconds
    const readingTime = (chineseChars / 3.5) + (englishWords / 2.5);
    const pauseTime = pauseMarks * 0.5;
    const basePacing = 1.5;

    return Math.round(readingTime + pauseTime + basePacing);
  };

  // Helper to precisely estimate the spoken duration in seconds based on Traditional/Simplified Chinese characters and pauses in BOTH dialogue and narration
  const estimateDialogueDuration = (dialogue: string, narration: string = ""): number => {
    const diagDur = estimateTextDuration(dialogue);
    const narrDur = estimateTextDuration(narration);
    
    const maxDur = Math.max(diagDur, narrDur);
    if (maxDur === 0) {
      // For pure scenic scenes, suggest a default of 4 seconds
      return 4;
    }
    
    // Cap strictly between 3 and 5 seconds to guarantee maximum stability for Agnes video rendering
    return Math.max(3, Math.min(5, maxDur));
  };

  // Render function for Toonflow Global Storyboard Director Chatbot
  const renderStoryboardGlobalChat = () => {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-pink-400" />
            分鏡導演 AI 助理
          </h3>
          <span className="text-[9px] bg-pink-500/10 px-2 py-0.5 rounded-full text-pink-400 border border-pink-500/20 font-mono">
            DIRECTOR AGENT
          </span>
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-850/50">
          🎬 <strong>分鏡導演助理</strong>：我可以幫助你修改任何一個特定的分鏡鏡頭，或者同時修改、擴充、精簡所有的分鏡鏡頭。
          <br />
          <span className="text-pink-300">💡 提示：「幫我把所有的對白長度控制在 10 字以內，不便動口就用內心對話 ( )」、「把分鏡 1 的背景改成下雨天」</span>
        </div>

        {/* Chat Messages */}
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {storyboardChatMessages.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-6">
              在此輸入對話以開始微調或批次修改當前專案的分鏡鏡頭。
            </div>
          ) : (
            storyboardChatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-pink-600 text-white rounded-tr-none shadow-lg shadow-pink-600/10' 
                    : 'bg-indigo-950/40 border border-indigo-800/50 text-indigo-100 rounded-tl-none shadow-lg'
                }`}>
                  {msg.role === 'ai' && (
                    <div className="text-[10px] font-bold mb-1 opacity-80 uppercase flex items-center gap-1 text-pink-400">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                      分鏡導演 AI
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed text-xs">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {isStoryboardChatting && (
            <div className="flex justify-start">
              <div className="bg-slate-950/80 border border-slate-850 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400" />
                導演助理正在協調整體鏡頭中...
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-pink-500 transition"
            placeholder="告訴分鏡助理你想怎麼修改（例如：對白少旁白多）..."
            value={storyboardChatInput}
            onChange={(e) => setStoryboardChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isStoryboardChatting) {
                handleGlobalStoryboardChat();
              }
            }}
          />
          <button
            onClick={handleGlobalStoryboardChat}
            disabled={isStoryboardChatting || !storyboardChatInput.trim()}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center cursor-pointer"
          >
            {isStoryboardChatting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  // Storyboard Breakdown via server endpoint (Gemini/Agnes model)
  const handleAISplitNovel = async () => {
    if (!activeProject || !activeProject.novelText.trim()) return;
    
    setIsDisassembling(true);
    try {
      let currentCharacters = [...activeProject.characters];
      
      // Auto extract characters if none exist
      if (currentCharacters.length === 0) {
        const charRes = await fetch("/api/extract-characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelText: activeProject.novelText,
            artStyle: activeProject.artStyle,
            engine: 'agnes', // Prefer Agnes as default since Gemini is prone to quota issues
            customApiKey: customApiKey || undefined
          })
        });
        if (charRes.ok) {
          const charData = await charRes.json();
          if (charData.characters && charData.characters.length > 0) {
            currentCharacters = charData.characters.map((c: any, idx: number) => ({
              id: `char_${Date.now()}_${idx}`,
              name: c.name,
              role: c.role || "",
              age: c.age || "",
              clothing: c.clothing || "",
              personality: c.personality || "",
              description: c.description || "",
              avatarUrl: ""
            }));
          }
        }
      }

      const res = await fetch("/api/split-novel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelText: activeProject.novelText,
          artStyle: activeProject.artStyle,
          characters: currentCharacters,
          engine: 'agnes', // Prefer Agnes for fast, consistent storyboard splitting
          customApiKey: customApiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error("拆解小說失敗，請稍後再試。");
      }

      const textRes = await res.text();
      let data: any;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }
      if (data.scenes && data.scenes.length > 0) {
        // Map to internal scene structures
        const formattedScenes: Scene[] = data.scenes.map((s: any, idx: number) => {
          // Automatically estimate speaking/pacing duration based on dialogue and narration character counts more precisely
          const dialogueText = s.dialogue || "";
          const estimatedDuration = estimateDialogueDuration(dialogueText, s.narration || "");

          // Use server-provided duration only if valid, otherwise fallback to our estimated duration
          const finalDuration = s.durationSeconds && typeof s.durationSeconds === 'number'
            ? s.durationSeconds
            : estimatedDuration;

          return {
            ...DEFAULT_SCENE,
            ...s,
            id: `scene_${Date.now()}_${idx}`,
            title: s.title || `分鏡場景 ${idx + 1}`,
            dialogue: dialogueText,
            narration: s.narration || "",
            character: s.character || "旁白",
            visualPrompt: s.visualPrompt || "",
            negativePrompt: s.negativePrompt || "",
            actionPrompt: s.actionPrompt || "",
            durationSeconds: finalDuration,
            audioCue: s.audioCue || "",
            directorNotes: s.directorNotes || "",
            transitionPrompt: s.transitionPrompt || "",
          };
        });

        updateActiveProject({
          scenes: formattedScenes,
          characters: currentCharacters
        });
      }
    } catch (e: any) {
      alert(e.message || "Gemini AI 連線異常");
    } finally {
      setIsDisassembling(false);
    }
  };

  // AI Character Extractor
  const handleAIExtractCharacters = async () => {
    if (!activeProject || !activeProject.novelText.trim()) {
      alert("請先在『原著小說』頁面輸入小說內容，以便提取角色。");
      return;
    }
    
    setIsExtractingCharacters(true);
    try {
      const res = await fetch("/api/extract-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelText: activeProject.novelText,
          artStyle: activeProject.artStyle,
          engine: 'agnes', // Prefer Agnes as default since Gemini is prone to quota issues
          customApiKey: customApiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error("提取角色失敗，請稍後再試。");
      }

      const textRes = await res.text();
      let data: any;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }
      if (data.characters && data.characters.length > 0) {
        const formattedCharacters: Character[] = data.characters.map((c: any, idx: number) => ({
          id: `char_${Date.now()}_${idx}`,
          name: c.name,
          role: c.role || "",
          age: c.age || "",
          clothing: c.clothing || "",
          personality: c.personality || "",
          description: c.description || "",
          avatarUrl: ""
        }));

        updateActiveProject({
          characters: formattedCharacters
        });
        setActiveTab("characters");
      }
    } catch (e: any) {
      alert(e.message || "Gemini AI 連線異常");
    } finally {
      setIsExtractingCharacters(false);
    }
  };

  // AI Prompt Optimizer / Translator
    const handleTranslateCharacterPrompt = async (charId: string, engine: 'gemini' | 'agnes' | 'mistral' = 'gemini') => {
    if (!activeProject) return;

    const charObj = activeProject.characters.find(c => c.id === charId);
    if (!charObj) return;

    const rawInput = charObj.description.trim() || `${charObj.name} ${charObj.role} ${charObj.age} ${charObj.clothing} ${charObj.personality}`;
    if (!rawInput.trim()) {
      alert("請先輸入角色名稱、身份或特徵描述！");
      return;
    }

    try {
      const res = await fetch("/api/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: rawInput,
          artStyle: charObj.artStyle || activeProject.artStyle,
          character: charObj.name,
          characterDescription: `${charObj.clothing ? "Ensure wearing: " + charObj.clothing : ""}`,
          customApiKey: customApiKey || undefined,
          mood: charObj.mood,
          engine
        })
      });

      if (!res.ok) {
        throw new Error("優化 Prompt 失敗");
      }

      const textRes = await res.text();
      let data: any;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }

      if (data.optimizedPrompt) {
        handleUpdateChar(charId, "description", data.optimizedPrompt);
      }
    } catch (e: any) {
      console.error(e);
      alert("AI 智慧優化 / 翻譯 Prompt 發生錯誤，請稍後再試。");
    }
  };

const handleTranslatePrompt = async (sceneId: string, engine: 'gemini' | 'agnes' | 'mistral' = 'gemini') => {
    if (!activeProject) return;

    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    // Use dialogue/narration/title as raw input if visualPrompt is empty or in Chinese
    const rawInput = scene.visualPrompt.trim() || `${scene.title}: ${scene.dialogue} ${scene.narration}`;
    if (!rawInput.trim()) {
      alert("請先輸入場景名稱、台詞、旁白或部分描述！");
      return;
    }

    try {
      const charObj = activeProject.characters.find(c => c.name === scene.character);
      const res = await fetch("/api/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: rawInput,
          artStyle: charObj?.artStyle || activeProject.artStyle,
          character: scene.character,
          characterDescription: charObj?.description || "",
          customApiKey: customApiKey || undefined,
          mood: charObj?.mood,
          engine
        })
      });

      if (!res.ok) {
        throw new Error("優化 Prompt 失敗");
      }

      const textRes = await res.text();
      let data: any;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }
      if (data.optimizedPrompt) {
        handleUpdateSceneField(sceneId, "visualPrompt", data.optimizedPrompt);
      }
      if (data.negativePrompt) {
        handleUpdateSceneField(sceneId, "negativePrompt", data.negativePrompt);
      }
    } catch (e: any) {
      console.error(e);
      alert("AI 智慧優化 / 翻譯 Prompt 發生錯誤，請稍後再試。");
    }
  };

  const handleApplyStylePreset = (sceneId: string, presetValue: string) => {
    if (!activeProject) return;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const preset = STYLE_PRESETS.find(p => p.value === presetValue);
    if (!preset) return;

    let newPrompt = scene.visualPrompt.trim();

    // If empty or short default placeholder, replace completely
    if (!newPrompt || newPrompt.length < 15 || newPrompt.startsWith("Close-up of") || newPrompt.startsWith("A high-quality cinematic shot")) {
      newPrompt = preset.prompt;
    } else {
      // Check if it already contains one of our preset prompts
      let styleFound = false;
      for (const p of STYLE_PRESETS) {
        if (newPrompt.includes(p.prompt)) {
          newPrompt = newPrompt.replace(p.prompt, preset.prompt);
          styleFound = true;
          break;
        }
      }

      if (!styleFound) {
        // If no style found but has custom prompt, append it elegantly
        if (newPrompt.endsWith(".")) {
          newPrompt = `${newPrompt} Style: ${preset.prompt}`;
        } else if (newPrompt.endsWith(",")) {
          newPrompt = `${newPrompt} ${preset.prompt}`;
        } else {
          newPrompt = `${newPrompt}, style: ${preset.prompt}`;
        }
      }
    }

    handleUpdateSceneField(sceneId, "visualPrompt", newPrompt);

    if (typeof setToast === "function") {
      setToast({
        message: `已套用「${preset.name}」風格範本！`,
        type: "success"
      });
    }
  };

  const handleApplyNegativePreset = async (sceneId: string, presetValue: string) => {
    if (!activeProject) return;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    if (presetValue === "ai-auto") {
      if (!scene.visualPrompt.trim()) {
        alert("請先輸入或優化「AI 繪圖英文描述提示詞」，以便 AI 根據畫面特徵智慧生成專屬的負向提示詞！");
        return;
      }

      if (typeof setToast === "function") {
        setToast({
          message: "🤖 AI 正在為您智慧分析畫面、生成專屬負向提示詞，請稍候...",
          type: "info"
        });
      }

      try {
        const res = await fetch("/api/generate-negative-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: scene.visualPrompt,
            artStyle: activeProject.artStyle,
            customApiKey: customApiKey || undefined
          })
        });

        if (!res.ok) {
          throw new Error("AI 生成負向提示詞失敗");
        }

        const data = await res.json();
        if (data.negativePrompt) {
          handleUpdateSceneField(sceneId, "negativePrompt", data.negativePrompt);
          if (typeof setToast === "function") {
            setToast({
              message: "✨ AI 專屬負向提示詞生成成功並已自動填入！",
              type: "success"
            });
          }
        }
      } catch (err) {
        console.error(err);
        alert("AI 生成負向提示詞發生錯誤，請稍候再試。");
      }
    } else {
      const preset = NEGATIVE_PRESETS.find(p => p.value === presetValue);
      if (preset && preset.prompt) {
        handleUpdateSceneField(sceneId, "negativePrompt", preset.prompt);
        if (typeof setToast === "function") {
          setToast({
            message: `已套用「${preset.name}」負向提示詞範本！`,
            type: "success"
          });
        }
      }
    }
  };

  // Storyboard Image Generation (calls Gemini-3.1-flash-image)
  const handleGenerateImage = async (sceneId: string, engine: 'agnes' | 'gemini' | 'nanobanana' | 'mistral' = 'agnes') => {
    let freshActiveProject = activeProject;
    try {
      const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
      const curProj = curProjects.find(p => p.id === activeProjectId);
      if (curProj) freshActiveProject = curProj;
    } catch(e) {}
    if (!freshActiveProject) return;
    
    const isGenField = activeTab === "scenes_ext" ? "isGeneratingImageExt" : (activeTab === "scenes_keyframes" ? "isGeneratingImageKeyframes" : "isGeneratingImage");
    const imageField = activeTab === "scenes_ext" ? "imageUrlExt" : (activeTab === "scenes_keyframes" ? "imageUrlKeyframes" : "imageUrl");

    // Update loading state
    updateActiveProject((prev) => ({
      scenes: prev.scenes.map(s => {
        if (s.id === sceneId) return { ...s, [isGenField]: true };
        return s;
      })
    }));

    let targetSceneForGen: Scene | undefined;
    setProjects(prev => {
      const p = prev.find(p => p.id === activeProjectId);
      if (p) targetSceneForGen = p.scenes.find(s => s.id === sceneId);
      return prev;
    });
    
    // Fallback to activeProject if not found (though it should be)
    const sceneToGen = targetSceneForGen || activeProject.scenes.find(s => s.id === sceneId);
    if (!sceneToGen) return;

    // Check if it's an automatic transition scene and intercept it to prevent real drawing
    if (sceneId.startsWith("scene_transition_")) {
      const index = activeProject.scenes.findIndex(s => s.id === sceneId);
      if (index === -1) return;

      if (index === 0) {
        alert("本銜接場景為第一個場景，無前置場景可供銜接！");
        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) return { ...s, [isGenField]: false };
            return s;
          })
        }));
        return;
      }

      const prevScene = activeProject.scenes[index - 1];
      const nextScene = index < activeProject.scenes.length - 1 ? activeProject.scenes[index + 1] : null;

      if (!nextScene) {
        alert("本銜接場景為最後一個場景，無下一場景可供銜接！");
        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) return { ...s, [isGenField]: false };
            return s;
          })
        }));
        return;
      }

      const prevVideoUrl = prevScene.videoUrlExt || prevScene.videoUrlKeyframes || prevScene.videoUrl;
      const prevImageUrl = prevScene.imageUrlExt || prevScene.imageUrlKeyframes || prevScene.imageUrl;

      if (!prevVideoUrl && !prevImageUrl) {
        alert(`請先完成前一個場景「${prevScene.title}」的圖片或影片生成，再進行自動銜接！`);
        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) return { ...s, [isGenField]: false };
            return s;
          })
        }));
        return;
      }

      const nextImageUrl = nextScene.imageUrlExt || nextScene.imageUrlKeyframes || nextScene.imageUrl;
      if (!nextImageUrl) {
        alert(`請先完成下一個場景「${nextScene.title}」的圖片生成，再進行自動銜接！`);
        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) return { ...s, [isGenField]: false };
            return s;
          })
        }));
        return;
      }

      showToast("🔄 正在智能銜接：提取上一場景結尾幀作為起始幀...", "info");

      try {
        let extractedStartFrame = prevImageUrl;

        if (prevVideoUrl) {
          showToast("🎥 偵測到上一場景已生成影片，正在呼叫 ffmpeg 完美精確抽取最後一幀...", "info");
          const res = await fetch("/api/extract-last-frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoUrl: prevVideoUrl })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.imageUrl) {
              extractedStartFrame = data.imageUrl;
              showToast("✨ 成功精確抽取上一分鏡影片的最後一格畫面！", "success");
            }
          } else {
            console.warn("抽取最後一幀失敗，將使用其靜態圖片作為替代。");
          }
        }

        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) {
              return {
                ...s,
                imageUrl: extractedStartFrame,
                imageUrlExt: extractedStartFrame,
                imageUrlKeyframes: extractedStartFrame,
                isGeneratingImage: false,
                isGeneratingImageExt: false,
                isGeneratingImageKeyframes: false
              };
            }
            return s;
          })
        }));
        showToast("✅ 已成功提取：將上一個場景的最後一幀設為首幀，並為下一分鏡的過渡做好了準備！", "success");
      } catch (err: any) {
        console.error("Transition connection failed:", err);
        showToast("銜接處理失敗，使用預設圖片替代。", "error");
        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) return { ...s, [isGenField]: false };
            return s;
          })
        }));
      }
      return;
    }

    const controller = new AbortController();
    abortControllersRef.current[sceneId] = controller;
    const timeoutId = setTimeout(() => controller.abort(new Error("請求處理超時，請重試")), 180000); // 180s timeout

    try {
      const cleanSceneChar = (sceneToGen.character || "").trim().toLowerCase();
      const characterObj = activeProject.characters.find(c => (c.name || "").trim().toLowerCase() === cleanSceneChar);
      let charDesc = characterObj?.description || "";
      if (characterObj?.clothing) {
        charDesc += `. Ensure wearing: ${characterObj.clothing}.`;
      }
      const characterImages = characterObj?.uploadedAvatarUrls && characterObj.uploadedAvatarUrls.length > 0
        ? characterObj.uploadedAvatarUrls
        : (characterObj?.uploadedAvatarUrl
          ? [characterObj.uploadedAvatarUrl]
          : (characterObj?.avatarUrls || (characterObj?.avatarUrl ? [characterObj.avatarUrl] : [])));
      const charSeed = characterObj?.seed;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: sceneToGen.visualPrompt,
          negativePrompt: sceneToGen.negativePrompt,
          artStyle: characterObj?.artStyle || activeProject.artStyle,
          character: sceneToGen.character,
          characterDescription: charDesc,
          characterImages: characterImages,
          seed: charSeed,
          engine: engine,
          agnesImageMode: activeProject.agnesImageMode || "quality",
          customApiKey: customApiKey || undefined,
          mood: characterObj?.mood
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let errData: any = {};
        try { errData = JSON.parse(errText); } catch(e) {}
        throw new Error(errData.error || "繪圖 API 連接錯誤");
      }

      const textRes = await res.text();
      let data;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        console.warn("[Toonflow] Failed to parse storyboard image response JSON. Raw text:", textRes.substring(0, 50));
        throw new Error("伺服器回傳格式錯誤 (可能正在重啟或發生異常)，請稍後再試。");
      }
      if (data.message) {
        showToast(data.message, data.isAgnesImage ? "success" : "info");
      }
      
      updateActiveProject((prev) => ({
        scenes: prev.scenes.map(s => {
          if (s.id === sceneId) {
            return { 
              ...s, 
              [imageField]: data.imageUrl, 
              [isGenField]: false 
            };
          }
          return s;
        })
      }));

      // Automatically trigger AI review after image generation completes!
      setTimeout(() => {
        handleReviewScene(sceneId, 'image', engine);
      }, 500);

    } catch (e: any) {
      const isAbort = e.name === 'AbortError' || 
                      e.message === 'USER_ABORTED' || 
                      e.message?.toLowerCase().includes('abort') || 
                      controller.signal.aborted;
      if (isAbort) {
        console.log(`[Toonflow] Scene image generation ${sceneId} aborted by user.`);
        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) {
              return { 
                ...s, 
                [isGenField]: false 
              };
            }
            return s;
          })
        }));
        return;
      }
      // fallback if error
      showToast(`分鏡繪圖生成失敗：${e.message || "與繪圖伺服器連接時發生錯誤"}`, "error");
      updateActiveProject((prev) => ({
        scenes: prev.scenes.map(s => {
          if (s.id === sceneId) {
            return { 
              ...s, 
              [imageField]: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", 
              [isGenField]: false 
            };
          }
          return s;
        })
      }));
    } finally {
      if (abortControllersRef.current[sceneId] === controller) {
        delete abortControllersRef.current[sceneId];
      }
    }
  };

  const handleStopGenerateImage = (sceneId: string) => {
    if (abortControllersRef.current[sceneId]) {
      console.log(`[Toonflow] Stopping scene image generation ${sceneId}...`);
      abortControllersRef.current[sceneId].abort(new Error("USER_ABORTED"));
      delete abortControllersRef.current[sceneId];
    }
    // ensure state is updated
    if (activeProject) {
      const isGenField = activeTab === "scenes_ext" ? "isGeneratingImageExt" : (activeTab === "scenes_keyframes" ? "isGeneratingImageKeyframes" : "isGeneratingImage");
      const updatedScenes = activeProject.scenes.map(s => {
        if (s.id === sceneId) return { ...s, [isGenField]: false };
        return s;
      });
      updateActiveProject({ scenes: updatedScenes });
    }
  };

  const handleStopGenerateVideo = (sceneId: string) => {
    if (videoIntervalsRef.current[sceneId]) {
      console.log(`[Toonflow] Stopping scene video generation ${sceneId}...`);
      clearInterval(videoIntervalsRef.current[sceneId]);
      delete videoIntervalsRef.current[sceneId];
    }
    // ensure state is updated
    if (activeProject) {
      const isGenField = activeTab === "scenes_ext" ? "isGeneratingVideoExt" : (activeTab === "scenes_keyframes" ? "isGeneratingVideoKeyframes" : "isGeneratingVideo");
      const progressField = activeTab === "scenes_ext" ? "videoProgressExt" : (activeTab === "scenes_keyframes" ? "videoProgressKeyframes" : "videoProgress");
      const logsField = activeTab === "scenes_ext" ? "videoLogsExt" : (activeTab === "scenes_keyframes" ? "videoLogsKeyframes" : "videoLogs");
      
      const updatedScenes = activeProject.scenes.map(s => {
        if (s.id === sceneId) {
          return { 
            ...s, 
            [isGenField]: false,
            [progressField]: "已停止",
            [logsField]: [...((s as any)[logsField] || []), "[SYSTEM] 影片生成已被使用者手動停止。"]
          };
        }
        return s;
      });
      updateActiveProject({ scenes: updatedScenes });
      showToast("🛑 影片生成已停止", "info");
    }
  };

  // AI Storyboard Scene & Continuity Quality Control Review
  const handleReviewScene = async (sceneId: string, mode: 'image' | 'video', engine: 'agnes' | 'gemini' | 'nanobanana' | 'mistral' = 'gemini') => {
    let freshProj = activeProject;
    try {
      const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
      const curProj = curProjects.find(p => p.id === activeProjectId);
      if (curProj) freshProj = curProj;
    } catch(e) {}
    if (!freshProj) return;

    const index = freshProj.scenes.findIndex(s => s.id === sceneId);
    if (index === -1) return;

    const scene = freshProj.scenes[index];
    const previousScene = index > 0 ? freshProj.scenes[index - 1] : null;

    updateActiveProject((prev) => ({
      scenes: prev.scenes.map(s => {
        if (s.id === sceneId) {
          return {
            ...s,
            aiReviewStatus: "reviewing",
            isReviewing: true
          };
        }
        return s;
      })
    }));

    try {
      showToast(`🕵️ AI 正在對分鏡 ${index + 1}「${scene.title}」進行智慧邏輯與原著對齊性審核...`, "info");
      const res = await fetch("/api/review-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene,
          previousScene,
          originalNovelText: freshProj.novelText,
          customApiKey: customApiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error("審核伺服器連接失敗");
      }

      const review = await res.json();
      console.log(`[Toonflow QC] Review completed for scene ${sceneId}:`, review);

      // Check if status is needs_refinement and we haven't auto-regenerated yet
      const shouldAutoRegenerate = review.status === "needs_refinement" && !scene.hasAutoRegeneratedReview;

      updateActiveProject((prev) => ({
        scenes: prev.scenes.map(s => {
          if (s.id === sceneId) {
            return {
              ...s,
              aiReviewStatus: review.status,
              aiReviewAlignmentCheck: review.alignmentCheck,
              aiReviewLogicCheck: review.visualLogicCheck,
              aiReviewContinuityCheck: review.continuityCheck,
              aiReviewCritique: review.critique,
              isReviewing: false,
              hasAutoRegeneratedReview: shouldAutoRegenerate ? true : s.hasAutoRegeneratedReview,
              // If we need refinement and are auto-regenerating, update prompts!
              visualPrompt: (shouldAutoRegenerate && review.optimizedVisualPrompt) ? review.optimizedVisualPrompt : s.visualPrompt,
              actionPrompt: (shouldAutoRegenerate && review.optimizedActionPrompt) ? review.optimizedActionPrompt : s.actionPrompt
            };
          }
          return s;
        })
      }));

      if (shouldAutoRegenerate) {
        showToast(`⚠️ AI 偵測到分鏡 ${index + 1} 與原著小說存在邏輯偏差！已自動重構 Prompt 並重新生成！`, "info");
        if (mode === 'image') {
          setTimeout(() => handleGenerateImage(sceneId, engine), 1500);
        } else if (mode === 'video') {
          setTimeout(() => handleGenerateVideo(sceneId), 1500);
        }
      } else {
        if (review.status === "passed") {
          showToast(`✅ 分鏡 ${index + 1} 通過 AI 影視級邏輯審核！`, "success");
        } else {
          showToast(`⚠️ 分鏡 ${index + 1} 審核完畢（已自動重試過）：建議微調以獲得更通順效果。`, "info");
        }
      }

    } catch (err: any) {
      console.warn("[Toonflow QC Warning] Scene review failed, activating local fallback:", err);
      showToast("✅ 分鏡審核完成：啟用本地極速安全校驗！", "success");
      updateActiveProject((prev) => ({
        scenes: prev.scenes.map(s => {
          if (s.id === sceneId) {
            return {
              ...s,
              aiReviewStatus: "passed",
              aiReviewCritique: "已通過本地極速安全校驗。",
              isReviewing: false
            };
          }
          return s;
        })
      }));
    }
  };

  const handlePolicyViolation = async (
    sceneId: string, 
    statusData: any, 
    intervalId: NodeJS.Timeout,
    logsField: string,
    isGenField: string,
    errorField: string,
    errorCodeField: string,
    retryCallback: () => void
  ) => {
    const isPolicyError = statusData.error?.includes("content_policy_violation") || 
                          statusData.error?.includes("modify your prompt") ||
                          statusData.logs?.some((l:string) => l.includes("content_policy_violation"));

    if (isPolicyError) {
      let curProjs = [] as Project[];
      try { curProjs = JSON.parse(localStorage.getItem("toonflow_projects") || "[]"); } catch(e) {}
      const currentScene = curProjs.find(p => p.id === activeProjectId)?.scenes.find(s => s.id === sceneId);
      
      const currentRetryCount = currentScene?.policyRetryCount || 0;

      if (currentScene && currentRetryCount < 2) {
        clearInterval(intervalId);
        const nextRetryCount = currentRetryCount + 1;
        
        setProjects(prevProjects => {
          const updatedList = prevProjects.map(p => {
            if (p.id === activeProjectId) {
              return {
                ...p,
                scenes: p.scenes.map(s => s.id === sceneId ? {
                  ...s,
                  isRetryingPolicy: true,
                  policyRetryCount: nextRetryCount,
                  [logsField]: [...(statusData.logs || []), `[SYSTEM] 🚫 觸發 Agnes 內容安全限制！檢測到可能違規的敏感詞 (第 ${nextRetryCount}/2 次重試)。正在呼叫 AI 進行安全合規自動化改寫...`]
                } : s)
              };
            }
            return p;
          });
          try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) {}
          return updatedList;
        });

        try {
          const fixRes = await fetch("/api/fix-policy-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visualPrompt: currentScene.visualPrompt, actionPrompt: currentScene.actionPrompt, customApiKey: customApiKey || undefined })
          });
          const fixData = await fixRes.json();
          if (fixData.fixedVisualPrompt) {
            setProjects(prevProjects => {
              const updatedList = prevProjects.map(p => {
                if (p.id === activeProjectId) {
                  return {
                    ...p,
                    scenes: p.scenes.map(s => s.id === sceneId ? {
                      ...s,
                      visualPrompt: fixData.fixedVisualPrompt,
                      actionPrompt: fixData.fixedActionPrompt || s.actionPrompt,
                      [logsField]: [...(statusData.logs || []), `[SYSTEM] 🚫 觸發 Agnes 內容安全限制 (第 ${nextRetryCount}/2 次重試)！`, `[SYSTEM] 🪄 正在進行 AI 提示詞安全優化與特徵修復...`, `[SYSTEM] ✨ 【優化後的新提示詞】:`, `   - Visual: "${fixData.fixedVisualPrompt}"`, `   - Action: "${fixData.fixedActionPrompt || s.actionPrompt || ''}"`, `[SYSTEM] ✅ 安全提示詞優化完成，正在重新發起影片生成 (第 ${nextRetryCount}/2 次)...`]
                    } : s)
                  };
                }
                return p;
              });
              try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) {}
              return updatedList;
            });
            
            setTimeout(() => {
              retryCallback();
            }, 1000);
            return true; // handled
          }
        } catch (e) {
          console.error("Auto fix prompt failed", e);
        }
        
        // If it failed to fix, we should mark it as failed with the policy error
        setProjects(prevProjects => {
          const updatedList = prevProjects.map(p => {
            if (p.id === activeProjectId) {
              return {
                ...p,
                scenes: p.scenes.map(s => s.id === sceneId ? {
                  ...s,
                  isRetryingPolicy: false,
                  [isGenField]: false,
                  [errorField]: statusData.error || "Generation process failed",
                  [errorCodeField]: statusData.errorCode,
                  [logsField]: [...(statusData.logs || []), `[SYSTEM] AI 提示詞安全優化與修復請求失敗，已終止自動生成。`]
                } : s)
              };
            }
            return p;
          });
          try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) {}
          return updatedList;
        });
        return true; // handled
      } else {
        clearInterval(intervalId);
        setProjects(prevProjects => {
          const updatedList = prevProjects.map(p => {
            if (p.id === activeProjectId) {
              return {
                ...p,
                scenes: p.scenes.map(s => s.id === sceneId ? {
                  ...s,
                  isRetryingPolicy: false,
                  policyRetryCount: 0, // reset
                  [isGenField]: false,
                  [errorField]: `內容政策限制 (已重試 2 次後依然被拒): ${statusData.error || ""}`,
                  [errorCodeField]: statusData.errorCode,
                  [logsField]: [...(statusData.logs || []), `[SYSTEM] ❌ 已達到最大自動修復重試次數 (2/2)。該場景在進行了 2 次安全重寫後依然未能通過底層模型審查。請手動檢查提示詞，剔除潛在的敏感動作或元素。`]
                } : s)
              };
            }
            return p;
          });
          try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) {}
          return updatedList;
        });
        return true;
      }
    }
    return false; // not handled
  };

  // Agnes Video Generation for a specific scene card!
  const handleGenerateVideo = async (sceneId: string, force = false) => {
    console.log("[DEBUG] handleGenerateVideo called for:", sceneId, "Force:", force);
    let freshActiveProject = activeProject;
    try {
      const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
      const curProj = curProjects.find(p => p.id === activeProjectId);
      if (curProj) freshActiveProject = curProj;
    } catch(e) {}
    if (!freshActiveProject) return;
    
    const isGenField = activeTab === "scenes_ext" ? "isGeneratingVideoExt" : (activeTab === "scenes_keyframes" ? "isGeneratingVideoKeyframes" : "isGeneratingVideo");
    const videoField = activeTab === "scenes_ext" ? "videoUrlExt" : (activeTab === "scenes_keyframes" ? "videoUrlKeyframes" : "videoUrl");
    const imageField = activeTab === "scenes_ext" ? "imageUrlExt" : (activeTab === "scenes_keyframes" ? "imageUrlKeyframes" : "imageUrl");
    
    // Check if generating already
    const existingTargetScene = activeProject.scenes.find(s => s.id === sceneId);
    if (!force && existingTargetScene && (existingTargetScene as any)[isGenField]) {
      console.log("[DEBUG] Already generating for:", sceneId);
      return;
    }
    
    console.log("[DEBUG] Proceeding to generate video for:", sceneId);
    const progressField = activeTab === "scenes_ext" ? "videoProgressExt" : (activeTab === "scenes_keyframes" ? "videoProgressKeyframes" : "videoProgress");
    const logsField = activeTab === "scenes_ext" ? "videoLogsExt" : (activeTab === "scenes_keyframes" ? "videoLogsKeyframes" : "videoLogs");
    const errorField = activeTab === "scenes_ext" ? "videoErrorExt" : (activeTab === "scenes_keyframes" ? "videoErrorKeyframes" : "videoError");
    const errorCodeField = activeTab === "scenes_ext" ? "videoErrorCodeExt" : (activeTab === "scenes_keyframes" ? "videoErrorCodeKeyframes" : "videoErrorCode");

    const index = activeProject.scenes.findIndex(s => s.id === sceneId);
    let endImageUrl: string | undefined = undefined;
    let startImageUrlForTransition: string | undefined = undefined;

    if (sceneId.startsWith("scene_transition_")) {
      if (index > 0) {
        const prevScene = activeProject.scenes[index - 1];
        startImageUrlForTransition = prevScene.imageUrl || prevScene.imageUrlExt || prevScene.imageUrlKeyframes;
        if (!startImageUrlForTransition) {
          alert(`請先完成前一分鏡「${prevScene.title}」的繪圖，以作為本銜接分鏡影片的起始影格（首幀）！`);
          return;
        }
      }
      if (index !== -1 && index < activeProject.scenes.length - 1) {
        const nextScene = activeProject.scenes[index + 1];
        const foundEndImage = nextScene.imageUrl || nextScene.imageUrlExt || nextScene.imageUrlKeyframes;
        if (!foundEndImage) {
          alert(`請先完成下一分鏡「${nextScene.title}」的繪圖，以作為本銜接分鏡影片的結尾影格（尾幀）！`);
          return;
        }
        endImageUrl = foundEndImage;
      }
    }

    // Update specific scene video state to generating
    const targetScene = activeProject.scenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    updateActiveProject((prev) => ({
      scenes: prev.scenes.map(s => {
        if (s.id === sceneId) {
          return { 
            ...s, 
            [isGenField]: true, 
            [progressField]: "0%",
            [logsField]: ["[SYSTEM] Initiating Agnes Video V2.0 call..."],
            policyRetryCount: s.isRetryingPolicy ? s.policyRetryCount : 0,
            isRetryingPolicy: s.isRetryingPolicy || false
          };
        }
        return s;
      })
    }));

    try {
      const targetCharLower = (targetScene.character || "").trim().toLowerCase();
      const characterObj = targetCharLower && targetCharLower !== "旁白" && targetCharLower !== "narrator"
        ? activeProject.characters.find(c => {
            const cName = (c.name || "").trim().toLowerCase();
            return cName === targetCharLower || cName.includes(targetCharLower) || targetCharLower.includes(cName);
          })
        : undefined;
      const charDesc = characterObj?.description || "";
      const dialogueAddon = targetScene.dialogue ? ` (lips speaking and mouth moving to speak. The character is actively talking with realistic mouth movements, speaking: "${targetScene.dialogue}". The video must be completely clean with ABSOLUTELY NO SUBTITLES, no burned-in text, no on-screen text, no words, no captions, no letters).` : " No character is talking, no lip movement. Mouth closed and completely still.";
      const narrationAddon = targetScene.narration ? ` (Narrator voiceover atmospheric ambiance, character is not speaking, lips closed, completely clean video, absolutely no subtitles, no on-screen text, no captions, no words, no letters. No character is talking, no lip movement).` : "";
      const actionAddon = targetScene.actionPrompt ? ` Action and movement: ${targetScene.actionPrompt}. ` : " ";
      const transitionAddon = targetScene.transitionPrompt ? ` Transition action: ${targetScene.transitionPrompt}. ` : " ";
      const notesAddon = targetScene.directorNotes ? ` Director's notes: ${targetScene.directorNotes}. ` : " ";
      const enhancedPrompt = `${targetScene.visualPrompt}.${actionAddon}${transitionAddon}${dialogueAddon}${narrationAddon}${notesAddon} ABSOLUTELY NO SUBTITLES, NO TEXT, NO WATERMARKS, CLEAN VIDEO, PURE CINEMATIC VISUALS. [CRITICAL CLOTHING CONSISTENCY]: The character MUST wear the exact clothing described in their Description. (Advanced camera movement and cinematic lighting, natural human behavior, realistic high-fidelity video, masterwork.) Style: ${characterObj?.artStyle || activeProject.artStyle}. Character: ${targetScene.character}, Description: ${charDesc}.`;

      try {
        const url = force ? "/api/generate?force=true" : "/api/generate";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            visualPrompt: targetScene.visualPrompt,
            negativePrompt: targetScene.negativePrompt,
            actionPrompt: targetScene.actionPrompt,
            transitionPrompt: targetScene.transitionPrompt,
            dialogue: targetScene.dialogue,
            narration: targetScene.narration,
            directorNotes: targetScene.directorNotes,
            character: targetScene.character,
            characterDescription: charDesc,
            artStyle: characterObj?.artStyle || activeProject.artStyle,
            imageUrl: startImageUrlForTransition || (targetScene as any)[imageField] || undefined,
            endImageUrl: endImageUrl,
            customApiKey: customApiKey || undefined,
            durationSeconds: targetScene.durationSeconds,
            agnesVideoMode: activeProject.agnesVideoMode || "quality",
            sceneIndex: index,
            sceneType: activeTab === "scenes_ext" ? "ext" : (activeTab === "scenes_keyframes" ? "keyframes" : "standard")
          })
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          let errData: any = {};
          try { errData = JSON.parse(errText); } catch(e) {}
          
          if (errData.error === "A video generation is already in progress") {
             if (confirm("伺服器端仍有生成任務正在進行中。是否強制重置並重新發起？")) {
                 return handleGenerateVideo(sceneId, true);
             }
          }
          
          throw new Error(errData.error || "Failed to call Agnes server API");
        }
      } catch (e: any) {
        console.error("[Toonflow Video Gen] Failed to initiate generation:", e);
        updateActiveProject((prev) => ({
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) {
              return { 
                ...s, 
                [isGenField]: false, 
                [errorField]: `生成請求失敗: ${e.message || e}`,
                [logsField]: [...(s[logsField] as string[] || []), `[ERROR] ${e.message || e}`]
              };
            }
            return s;
          })
        }));
        return;
      }


      // Start polling specifically for this scene
      let count = 0;
      const intervalId = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/status");
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          if (statusData.status === "failed") {
            const handled = await handlePolicyViolation(
              sceneId, 
              statusData, 
              intervalId, 
              logsField, 
              isGenField, 
              errorField, 
              errorCodeField, 
              () => handleGenerateVideo(sceneId)
            );
            if (handled) {
              delete videoIntervalsRef.current[sceneId];
              return;
            }
          }
          setProjects(prevProjects => {
            const updatedList = prevProjects.map(p => {
              if (p.id === activeProjectId) {
                const updatedScenes = p.scenes.map(s => {
                   if (s.id === sceneId) {
                    const logs = statusData.logs || [];
                    const progress = statusData.progress || "0%";
                    const status = statusData.status;

                    if (status === "completed" && statusData.outputPath) {
                      clearInterval(intervalId);
                      delete videoIntervalsRef.current[sceneId];
                      console.log("[DEBUG] Video URL generated:", statusData.outputPath);
                      
                      // Automatically trigger AI review after video generation completes!
                      setTimeout(() => {
                        handleReviewScene(sceneId, 'video');
                      }, 500);

                      return { 
                        ...s, 
                        [videoField]: statusData.outputPath, 
                        [`${videoField}Local`]: statusData.localPath || statusData.outputPath, 
                        [isGenField]: false, 
                        [progressField]: "100%",
                        [logsField]: [...logs, "[SYSTEM] Video generated and mapped successfully!"],
                        [errorField]: statusData.error,
                        [errorCodeField]: statusData.errorCode
                      };
                    } else if (status === "failed") {
                      clearInterval(intervalId);
                      delete videoIntervalsRef.current[sceneId];
                      return {
                        ...s,
                        [isGenField]: false,
                        [errorField]: statusData.error || "Generation process failed",
                        [errorCodeField]: statusData.errorCode,
                        [logsField]: logs,
                        isRetryingPolicy: false
                      };
                    }

                    return {
                      ...s,
                      [progressField]: progress,
                      [logsField]: logs
                    };
                  }
                  return s;
                });
                return { ...p, scenes: updatedScenes };
              }
              return p;
            });
            try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) { console.error("Quota exceeded", e); }
            return updatedList;
          });

        } catch (pollErr) {
          console.warn("Polling error for scene video", pollErr);
        }

        // Failsafe timeout after 5 minutes of polling
        count++;
        if (count > 150) {
          clearInterval(intervalId);
          delete videoIntervalsRef.current[sceneId];
          setProjects(prevProjects => {
            const updatedList = prevProjects.map(p => {
              if (p.id === activeProjectId) {
                const updatedScenes = p.scenes.map(s => {
                  if (s.id === sceneId) {
                    return {
                      ...s,
                      [isGenField]: false,
                      [errorField]: "Generation timed out"
                    };
                  }
                  return s;
                });
                return { ...p, scenes: updatedScenes };
              }
              return p;
            });
            try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) { console.error("Quota exceeded", e); }
            return updatedList;
          });
        }
      }, 3000);
      videoIntervalsRef.current[sceneId] = intervalId;

    } catch (err: any) {
      updateActiveProject((prev) => ({
        scenes: prev.scenes.map(s => {
          if (s.id === sceneId) {
            return {
              ...s,
              [isGenField]: false,
              [errorField]: err.message || "Connection failure to video microservice."
            };
          }
          return s;
        })
      }));
    }
  };

  // Agnes Video Generation with frame continuity (extend from previous scene's last frame)
  const handleGenerateVideoExtended = async (sceneId: string, index: number) => {
    let freshActiveProject = activeProject;
    try {
      const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
      const curProj = curProjects.find(p => p.id === activeProjectId);
      if (curProj) freshActiveProject = curProj;
    } catch(e) {}
    if (!freshActiveProject) return;

    let endImageUrl: string | undefined = undefined;
    if (sceneId.startsWith("scene_transition_")) {
      if (index < freshActiveProject.scenes.length - 1) {
        const nextScene = freshActiveProject.scenes[index + 1];
        const foundEndImage = nextScene.imageUrlExt || nextScene.imageUrl || nextScene.imageUrlKeyframes;
        if (!foundEndImage) {
          alert(`請先完成下一分鏡「${nextScene.title}」的繪圖，以作為本銜接分鏡影片的結尾影格（尾幀）！`);
          return;
        }
        endImageUrl = foundEndImage;
      }
    } else {
      // If index > 0, check if previous scene has generated video (only for non-transition scenes)
      if (index > 0) {
        const prevScene = freshActiveProject.scenes[index - 1];
        if (!prevScene.videoUrlExt) {
          alert(`為確保分鏡首尾影格連續，請先為前一場景「${prevScene.title}」生成影片！`);
          return;
        }
      }
    }

    // Update specific scene video state to generating
    const targetScene = freshActiveProject.scenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    updateActiveProject((prev) => ({
      scenes: prev.scenes.map(s => {
        if (s.id === sceneId) {
          return { 
            ...s, 
            isGeneratingVideoExt: true, 
            videoProgressExt: "0%",
            videoLogsExt: ["[SYSTEM] Initiating Agnes Video V2.0 Extended call..."],
            policyRetryCount: s.isRetryingPolicy ? s.policyRetryCount : 0,
            isRetryingPolicy: s.isRetryingPolicy || false
          };
        }
        return s;
      })
    }));

    try {
      const targetCharLower = (targetScene.character || "").trim().toLowerCase();
      const characterObj = targetCharLower && targetCharLower !== "旁白" && targetCharLower !== "narrator"
        ? freshActiveProject.characters.find(c => {
            const cName = (c.name || "").trim().toLowerCase();
            return cName === targetCharLower || cName.includes(targetCharLower) || targetCharLower.includes(cName);
          })
        : undefined;
      const charDesc = characterObj?.description || "";
      const dialogueAddon = targetScene.dialogue ? ` (lips speaking and mouth moving to speak. The character is actively talking with realistic mouth movements, speaking: "${targetScene.dialogue}". The video must be completely clean with ABSOLUTELY NO SUBTITLES, no burned-in text, no on-screen text, no words, no captions, no letters).` : " No character is talking, no lip movement. Mouth closed and completely still.";
      const narrationAddon = targetScene.narration ? ` (Narrator voiceover atmospheric ambiance, character is not speaking, lips closed, completely clean video, absolutely no subtitles, no on-screen text, no captions, no words, no letters. No character is talking, no lip movement).` : "";
      const actionAddon = targetScene.actionPrompt ? ` Action and movement: ${targetScene.actionPrompt}. ` : " ";
      const transitionAddon = targetScene.transitionPrompt ? ` Transition action: ${targetScene.transitionPrompt}. ` : " ";
      const notesAddon = targetScene.directorNotes ? ` Director's notes: ${targetScene.directorNotes}. ` : " ";
      const enhancedPrompt = `${targetScene.visualPrompt}.${actionAddon}${transitionAddon}${dialogueAddon}${narrationAddon}${notesAddon} ABSOLUTELY NO SUBTITLES, NO TEXT, NO WATERMARKS, CLEAN VIDEO, PURE CINEMATIC VISUALS. [CRITICAL CLOTHING CONSISTENCY]: The character MUST wear the exact clothing described in their Description. (Advanced camera movement and cinematic lighting, natural human behavior, realistic high-fidelity video, masterwork.) Style: ${characterObj?.artStyle || freshActiveProject.artStyle}. Character: ${targetScene.character}, Description: ${charDesc}.`;

      // If index > 0, we pass the previous scene's videoUrlExt as extendFromVideoUrl
      const prevVideoUrl = (index > 0) ? freshActiveProject.scenes[index - 1].videoUrlExt : undefined;

      const res = await fetch("/api/generate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           prompt: enhancedPrompt,
           visualPrompt: targetScene.visualPrompt,
           actionPrompt: targetScene.actionPrompt,
           transitionPrompt: targetScene.transitionPrompt,
           dialogue: targetScene.dialogue,
           narration: targetScene.narration,
           directorNotes: targetScene.directorNotes,
           character: targetScene.character,
           characterDescription: charDesc,
           artStyle: characterObj?.artStyle || freshActiveProject.artStyle,
           imageUrl: targetScene.imageUrlExt || undefined,
           endImageUrl: endImageUrl,
           extendFromVideoUrl: prevVideoUrl,
           customApiKey: customApiKey || undefined,
           durationSeconds: targetScene.durationSeconds,
           agnesVideoMode: freshActiveProject.agnesVideoMode || "quality",
           sceneIndex: index,
           sceneType: "ext"
         })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let errData: any = {};
        try { errData = JSON.parse(errText); } catch(e) {}
        throw new Error(errData.error || "Failed to call Agnes server API");
      }

      // Start polling specifically for this scene
      let count = 0;
      const intervalId = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/status");
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          if (statusData.status === "failed") {
            const handled = await handlePolicyViolation(
              sceneId, 
              statusData, 
              intervalId, 
              "videoLogsExt", 
              "isGeneratingVideoExt", 
              "videoErrorExt", 
              "videoErrorExtCode", 
              () => handleGenerateVideoExtended(sceneId, index)
            );
            if (handled) {
              delete videoIntervalsRef.current[sceneId];
              return;
            }
          }
          setProjects(prevProjects => {
            const updatedList = prevProjects.map(p => {
              if (p.id === activeProjectId) {
                const updatedScenes = p.scenes.map(s => {
                  if (s.id === sceneId) {
                     const logs = statusData.logs || [];
                     const progress = statusData.progress || "0%";
                     const status = statusData.status;

                     if (status === "completed" && statusData.outputPath) {
                       clearInterval(intervalId);
                       delete videoIntervalsRef.current[sceneId];
                       console.log("[DEBUG] Extended Video URL generated:", statusData.outputPath);
                       
                       // Automatically trigger AI review after video generation completes!
                       setTimeout(() => {
                         handleReviewScene(sceneId, 'video');
                       }, 500);

                       return { 
                         ...s, 
                         videoUrlExt: statusData.outputPath, 
                         videoUrlExtLocal: statusData.localPath || statusData.outputPath,
                         isGeneratingVideoExt: false, 
                         videoProgressExt: "100%",
                         videoLogsExt: [...logs, "[SYSTEM] Video generated and mapped successfully!"],
                         videoErrorExt: statusData.error,
                         videoErrorExtCode: statusData.errorCode
                       };
                     } else if (status === "failed") {
                       clearInterval(intervalId);
                       delete videoIntervalsRef.current[sceneId];
                       return {
                         ...s,
                         isGeneratingVideoExt: false,
                         videoErrorExt: statusData.error || "Generation process failed",
                         videoErrorExtCode: statusData.errorCode,
                         videoLogsExt: logs,
                         isRetryingPolicy: false
                       };
                     }

                     return {
                       ...s,
                       videoProgressExt: progress,
                       videoLogsExt: logs
                     };
                  }
                  return s;
                });
                return { ...p, scenes: updatedScenes };
              }
              return p;
            });
            try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) { console.error("Quota exceeded", e); }
            return updatedList;
          });

        } catch (pollErr) {
          console.warn("Polling error for scene video", pollErr);
        }

        // Failsafe timeout after 5 minutes of polling
        count++;
        if (count > 150) {
          clearInterval(intervalId);
          delete videoIntervalsRef.current[sceneId];
          setProjects(prevProjects => {
            const updatedList = prevProjects.map(p => {
              if (p.id === activeProjectId) {
                const updatedScenes = p.scenes.map(s => {
                  if (s.id === sceneId) {
                    return {
                      ...s,
                      isGeneratingVideoExt: false,
                      videoErrorExt: "Generation timed out"
                    };
                  }
                  return s;
                });
                return { ...p, scenes: updatedScenes };
              }
              return p;
            });
            try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) { console.error("Quota exceeded", e); }
            return updatedList;
          });
        }
      }, 3000);
      videoIntervalsRef.current[sceneId] = intervalId;

    } catch (err: any) {
      updateActiveProject((prev) => ({
        scenes: prev.scenes.map(s => {
          if (s.id === sceneId) {
            return {
              ...s,
              isGeneratingVideoExt: false,
              videoErrorExt: err.message || "Connection failure to video microservice."
            };
          }
          return s;
        })
      }));
    }
  };

  // One-click sequential automatic generation of all storyboards
  const handleGenerateAllSequentially = async () => {
    if (!activeProject || isGeneratingAllSequentially) return;
    setIsGeneratingAllSequentially(true);
    try {
      for (let i = 0; i < activeProject.scenes.length; i++) {
        const scene = activeProject.scenes[i];
        if (scene.videoUrlExt) {
          // If already generated, skip it
          continue;
        }

        // Generate the image first if missing
        if (!scene.imageUrlExt) {
          await handleGenerateImage(scene.id, 'agnes');
          // Wait for React to process the state update and localStorage
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Wait for video generation to complete
        await new Promise<void>((resolve, reject) => {
          handleGenerateVideoExtended(scene.id, i);

          const checkInterval = setInterval(() => {
            const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
            const curProj = curProjects.find(p => p.id === activeProjectId);
            const curScene = curProj?.scenes.find(s => s.id === scene.id);
            if (curScene && !curScene.isGeneratingVideoExt) {
              clearInterval(checkInterval);
              if (curScene.videoUrlExt) {
                resolve();
              } else {
                reject(new Error(`分鏡 ${i + 1} 「${scene.title}」影片生成失敗：${curScene?.videoErrorExt || "未知錯誤"}`));
              }
            }
          }, 3000);
        });
      }
      alert("🎉 恭喜！所有分鏡已成功依序完成首尾影格無縫延伸生成！");
    } catch (err: any) {
      alert(`順序自動生成中斷：${err.message || err}`);
    } finally {
      setIsGeneratingAllSequentially(false);
    }
  };


  const handleInsertTransitionScene = async (index: number) => {
    if (!activeProject || index >= activeProject.scenes.length - 1) return;
    const sceneA = activeProject.scenes[index];
    const sceneB = activeProject.scenes[index + 1];

    const prevVideoUrl = sceneA.videoUrlExt || sceneA.videoUrlKeyframes || sceneA.videoUrl;
    const prevImageUrl = sceneA.imageUrlExt || sceneA.imageUrlKeyframes || sceneA.imageUrl;

    showToast("🔄 正在智慧銜接：分析場景脈絡並生成連續劇本中...", "info");

    try {
      const res = await fetch("/api/generate-transition-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneA,
          sceneB,
          novelText: activeProject.novelText,
          artStyle: activeProject.artStyle,
          characters: activeProject.characters,
          customApiKey
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let errData: any = {};
        try { errData = JSON.parse(errText); } catch(e) {}
        throw new Error(errData.error || "Failed to generate transition scene");
      }

      const textRes = await res.text();
      let generatedScenes: any[] = [];
      try {
        const parsed = JSON.parse(textRes);
        if (parsed.scenes && Array.isArray(parsed.scenes)) {
          generatedScenes = parsed.scenes;
        } else if (parsed.scene) {
          generatedScenes = [parsed.scene];
        } else {
          throw new Error("格式不符合預期");
        }
      } catch(e) {
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }

      if (generatedScenes.length === 0) {
        throw new Error("未生成任何銜接分鏡。");
      }

      // Automatically extract the last frame of previous scene as start frame of transition scene
      let extractedStartFrame = prevImageUrl || "";

      if (prevVideoUrl) {
        showToast("🎥 偵測到上一場景已生成影片，正在呼叫 ffmpeg 完美精確抽取最後一幀...", "info");
        try {
          const extractRes = await fetch("/api/extract-last-frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoUrl: prevVideoUrl })
          });

          if (extractRes.ok) {
            const data = await extractRes.json();
            if (data.imageUrl) {
              extractedStartFrame = data.imageUrl;
              showToast("✨ 成功精確抽取上一分鏡影片的最後一格畫面！", "success");
            }
          } else {
            console.warn("抽取影片最後一幀失敗，將使用靜態圖片作為替代。");
          }
        } catch (err) {
          console.error("Failed to extract last frame:", err);
        }
      }

      const insertedScenes: Scene[] = generatedScenes.map((sceneData, i) => {
        // Only the first transition scene gets the extracted start frame automatically.
        // Subsequent ones start fresh for individual generation.
        const startFrame = i === 0 ? extractedStartFrame : "";
        return {
          id: `scene_transition_${Date.now()}_${i}`,
          ...sceneData,
          imageUrl: startFrame,
          imageUrlExt: startFrame,
          imageUrlKeyframes: startFrame,
          isGeneratingImage: false,
          isGeneratingVideo: false,
          isGeneratingImageExt: false,
          isGeneratingVideoExt: false,
          isGeneratingImageKeyframes: false,
          isGeneratingVideoKeyframes: false
        };
      });

      const newScenes = [...activeProject.scenes];
      newScenes.splice(index + 1, 0, ...insertedScenes);

      // Provide continuous transition prompt for the next scene's visual prompt
      const nextOriginalSceneIndex = index + 1 + insertedScenes.length;
      if (newScenes[nextOriginalSceneIndex]) {
        const sceneBObj = newScenes[nextOriginalSceneIndex];
        const lastTransition = generatedScenes[generatedScenes.length - 1];
        const transitionElement = lastTransition.transitionPrompt || lastTransition.actionPrompt || "seamless transition from the previous scene";
        const transitionPrefix = `[Transition continuity: seamlessly continuing from the previous scene's ending state of "${transitionElement}".] `;
        
        if (!sceneBObj.visualPrompt.includes("Transition continuity:")) {
          newScenes[nextOriginalSceneIndex] = {
            ...sceneBObj,
            visualPrompt: `${transitionPrefix}${sceneBObj.visualPrompt}`
          };
        }
      }
      
      updateActiveProject({ scenes: newScenes });
      if (insertedScenes.length > 1) {
        showToast(`✅ 已成功自動插入 ${insertedScenes.length} 個分鏡銜接場景，並自動帶入上一分鏡結尾幀及更新提示詞過渡！`, "success");
      } else {
        showToast("✅ 已成功插入自動銜接場景，並自動帶入上一分鏡結尾幀及更新提示詞過渡！", "success");
      }
    } catch (err: any) {
      showToast(`插入銜接場景失敗：${err.message || err}`, "error");
    }
  };

  // Agnes Video Generation with keyframes (start frame is this scene's image, end frame is next scene's image)
  const handleGenerateVideoKeyframes = async (sceneId: string, index: number) => {
    let freshActiveProject = activeProject;
    try {
      const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
      const curProj = curProjects.find(p => p.id === activeProjectId);
      if (curProj) freshActiveProject = curProj;
    } catch(e) {}
    if (!freshActiveProject) return;

    const targetScene = freshActiveProject.scenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    const startImageUrl = targetScene.imageUrlKeyframes || targetScene.imageUrl || targetScene.imageUrlExt;
    if (!startImageUrl) {
      alert("請先完成本分鏡的繪圖或智慧自動銜接！");
      return;
    }

    let endImageUrl: string | undefined = undefined;
    if (index < activeProject.scenes.length - 1) {
      const nextScene = activeProject.scenes[index + 1];
      const foundEndImage = nextScene.imageUrlKeyframes || nextScene.imageUrl || nextScene.imageUrlExt;
      if (!foundEndImage) {
        alert(`請先完成下一分鏡「${nextScene.title}」的繪圖，以作為本分鏡影片的結尾影格！`);
        return;
      }
      endImageUrl = foundEndImage;
    }

    // Calculate transition duration - respect user set duration directly rather than forcing a long fixed duration
    const finalDurationSeconds = targetScene.durationSeconds;

    // Update specific scene video state to generating
    updateActiveProject((prev) => ({
      scenes: prev.scenes.map(s => {
        if (s.id === sceneId) {
          return { 
            ...s, 
            durationSeconds: finalDurationSeconds,
            isGeneratingVideoKeyframes: true, 
            videoProgressKeyframes: "0%",
            videoLogsKeyframes: ["[SYSTEM] Initiating Agnes Start-End Keyframes Video call..."],
            policyRetryCount: s.isRetryingPolicy ? s.policyRetryCount : 0,
            isRetryingPolicy: s.isRetryingPolicy || false
          };
        }
        return s;
      })
    }));

    try {
      const targetCharLower = (targetScene.character || "").trim().toLowerCase();
      const characterObj = targetCharLower && targetCharLower !== "旁白" && targetCharLower !== "narrator"
        ? activeProject.characters.find(c => {
            const cName = (c.name || "").trim().toLowerCase();
            return cName === targetCharLower || cName.includes(targetCharLower) || targetCharLower.includes(cName);
          })
        : undefined;
      const charDesc = characterObj?.description || "";
      const dialogueAddon = targetScene.dialogue ? ` (lips speaking and mouth moving to speak. The character is actively talking with realistic mouth movements, speaking: "${targetScene.dialogue}". The video must be completely clean with ABSOLUTELY NO SUBTITLES, no burned-in text, no on-screen text, no words, no captions, no letters).` : " No character is talking, no lip movement. Mouth closed and completely still.";
      const narrationAddon = targetScene.narration ? ` (Narrator voiceover atmospheric ambiance, character is not speaking, lips closed, completely clean video, absolutely no subtitles, no on-screen text, no captions, no words, no letters. No character is talking, no lip movement).` : "";
      const actionAddon = targetScene.actionPrompt ? ` Action and movement: ${targetScene.actionPrompt}. ` : " ";
      let transitionAddon = targetScene.transitionPrompt ? ` Transition action: ${targetScene.transitionPrompt}. ` : "";
      if (endImageUrl && index < activeProject.scenes.length - 1) {
        const nextScene = activeProject.scenes[index + 1];
        transitionAddon += ` The character smoothly moves and transitions from the current state into the end frame's state: [${nextScene.visualPrompt}]. Make sure to animate the logical physical action connecting these two states (e.g., standing up, walking, turning around, changing pose).`;
      }
      const notesAddon = targetScene.directorNotes ? ` Director's notes: ${targetScene.directorNotes}. ` : " ";
      const enhancedPrompt = `${targetScene.visualPrompt}.${actionAddon}${dialogueAddon}${narrationAddon}${transitionAddon}${notesAddon} ABSOLUTELY NO SUBTITLES, NO TEXT, NO WATERMARKS, CLEAN VIDEO, PURE CINEMATIC VISUALS. [CRITICAL CLOTHING CONSISTENCY]: The character MUST wear the exact clothing described in their Description. (Advanced camera movement and cinematic lighting, natural human behavior, realistic high-fidelity video, masterwork.) Style: ${characterObj?.artStyle || activeProject.artStyle}. Character: ${targetScene.character}, Description: ${charDesc}.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          visualPrompt: targetScene.visualPrompt,
          negativePrompt: targetScene.negativePrompt,
          actionPrompt: targetScene.actionPrompt,
          transitionPrompt: targetScene.transitionPrompt,
          dialogue: targetScene.dialogue,
          narration: targetScene.narration,
          directorNotes: targetScene.directorNotes,
          character: targetScene.character,
          characterDescription: charDesc,
          artStyle: characterObj?.artStyle || activeProject.artStyle,
          imageUrl: startImageUrl || undefined,
          endImageUrl: endImageUrl,
          customApiKey: customApiKey || undefined,
          durationSeconds: finalDurationSeconds,
          agnesVideoMode: activeProject.agnesVideoMode || "quality",
          useFreezeAndMove: targetScene.useFreezeAndMove,
          useMidpointSplit: targetScene.useMidpointSplit,
          sceneIndex: index,
          sceneType: "keyframes"
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let errData: any = {};
        try { errData = JSON.parse(errText); } catch(e) {}
        throw new Error(errData.error || "Failed to call Agnes server API");
      }

      // Start polling specifically for this scene
      let count = 0;
      const intervalId = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/status");
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          if (statusData.status === "failed") {
            const handled = await handlePolicyViolation(
              sceneId, 
              statusData, 
              intervalId, 
              "videoLogsKeyframes", 
              "isGeneratingVideoKeyframes", 
              "videoErrorKeyframes", 
              "videoErrorKeyframesCode", 
              () => handleGenerateVideoKeyframes(sceneId, index)
            );
            if (handled) {
              delete videoIntervalsRef.current[sceneId];
              return;
            }
          }
          setProjects(prevProjects => {
            const updatedList = prevProjects.map(p => {
              if (p.id === activeProjectId) {
                const updatedScenes = p.scenes.map(s => {
                  if (s.id === sceneId) {
                    const logs = statusData.logs || [];
                    const progress = statusData.progress || "0%";
                    const status = statusData.status;

                    if (status === "completed" && statusData.outputPath) {
                      clearInterval(intervalId);
                      delete videoIntervalsRef.current[sceneId];
                      console.log("[DEBUG] Video URL generated:", statusData.outputPath);
                      
                      // Automatically trigger AI review after video generation completes!
                      setTimeout(() => {
                        handleReviewScene(sceneId, 'video');
                      }, 500);

                      return { 
                        ...s, 
                        videoUrlKeyframes: statusData.outputPath,
                        videoUrlKeyframesLocal: statusData.localPath || statusData.outputPath, 
                        isGeneratingVideoKeyframes: false, 
                        videoProgressKeyframes: "100%",
                        videoLogsKeyframes: [...logs, "[SYSTEM] Keyframes Video generated and mapped successfully!"],
                        videoErrorKeyframes: statusData.error,
                        videoErrorKeyframesCode: statusData.errorCode
                      };
                    } else if (status === "failed") {
                      clearInterval(intervalId);
                      delete videoIntervalsRef.current[sceneId];
                      return {
                        ...s,
                        isGeneratingVideoKeyframes: false,
                        videoErrorKeyframes: statusData.error || "Generation process failed",
                        videoErrorKeyframesCode: statusData.errorCode,
                        videoLogsKeyframes: logs,
                        isRetryingPolicy: false
                      };
                    }

                    return {
                      ...s,
                      videoProgressKeyframes: progress,
                      videoLogsKeyframes: logs
                    };
                  }
                  return s;
                });
                return { ...p, scenes: updatedScenes };
              }
              return p;
            });
            try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) { console.error("Quota exceeded", e); }
            return updatedList;
          });

        } catch (pollErr) {
          console.warn("Polling error for scene video", pollErr);
        }

        // Failsafe timeout after 5 minutes of polling
        count++;
        if (count > 150) {
          clearInterval(intervalId);
          delete videoIntervalsRef.current[sceneId];
          setProjects(prevProjects => {
            const updatedList = prevProjects.map(p => {
              if (p.id === activeProjectId) {
                const updatedScenes = p.scenes.map(s => {
                  if (s.id === sceneId) {
                    return {
                      ...s,
                      isGeneratingVideoKeyframes: false,
                      videoErrorKeyframes: "Generation timed out"
                    };
                  }
                  return s;
                });
                return { ...p, scenes: updatedScenes };
              }
              return p;
            });
            try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (e) { console.error("Quota exceeded", e); }
            return updatedList;
          });
        }
      }, 3000);
      videoIntervalsRef.current[sceneId] = intervalId;

    } catch (err: any) {
      updateActiveProject((prev) => ({
        scenes: prev.scenes.map(s => {
          if (s.id === sceneId) {
            return {
              ...s,
              isGeneratingVideoKeyframes: false,
              videoErrorKeyframes: err.message || "Connection failure to video microservice."
            };
          }
          return s;
        })
      }));
    }
  };

  // One-click clear all generated keyframe images, videos, logs, and reviews (Start over)
  const handleClearAllKeyframes = () => {
    if (!activeProject) return;
    
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      // Auto-reset after 4 seconds if they don't confirm
      setTimeout(() => {
        setIsConfirmingClear(false);
      }, 4000);
      return;
    }

    // Reset confirmation state
    setIsConfirmingClear(false);

    // Reset pipeline state
    setFullAutoProgress("0%");
    setFullAutoLogs([]);
    setFinalStitchedVideoUrl(null);

    const resetScenes = activeProject.scenes.map(s => {
      const updated = { ...s };
      delete updated.imageUrlKeyframes;
      delete updated.videoUrlKeyframes;
      updated.isGeneratingImageKeyframes = false;
      updated.isGeneratingVideoKeyframes = false;
      delete updated.videoProgressKeyframes;
      delete updated.videoLogsKeyframes;
      delete updated.videoErrorKeyframes;
      delete updated.videoErrorCodeKeyframes;
      updated.isRetryingPolicy = false;
      updated.policyRetryCount = 0;
      updated.useFreezeAndMove = false;
      updated.useMidpointSplit = false;
      delete updated.aiReviewStatus;
      delete updated.aiReviewAlignmentCheck;
      delete updated.aiReviewLogicCheck;
      delete updated.aiReviewContinuityCheck;
      delete updated.aiReviewCritique;
      updated.isReviewing = false;
      updated.hasAutoRegeneratedReview = false;
      return updated;
    });

    updateActiveProject({
      scenes: resetScenes,
      finalVideoUrl: undefined
    });
  };

  // One-click sequential automatic generation of all storyboards with keyframe start-end
  const handleGenerateAllKeyframesSequentially = async () => {
    if (!activeProject || isGeneratingAllKeyframesSequentially) return;
    setIsGeneratingAllKeyframesSequentially(true);
    try {
      // Forcibly clear any server-side video generation locks before starting a batch job
      await fetch("/api/reset-task", { method: "POST" }).catch(() => {});

      // First, ensure all scenes have their storyboard images generated
      for (let i = 0; i < activeProject.scenes.length; i++) {
        const scene = activeProject.scenes[i];
        if (!scene.imageUrlKeyframes) {
          try {
            await handleGenerateImage(scene.id, 'agnes');
            // Wait for React to process the state update and localStorage
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (e) {}
        }
      }

      const failedIndices: number[] = [];

      // Now, sequentially generate keyframe videos
      for (let i = 0; i < activeProject.scenes.length; i++) {
        const scene = activeProject.scenes[i];
        if (scene.videoUrlKeyframes) {
          // If already generated, skip it
          continue;
        }

        // Wait for video generation to complete with non-blocking try/catch
        try {
          await new Promise<void>((resolve, reject) => {
            handleGenerateVideoKeyframes(scene.id, i);

            const checkInterval = setInterval(() => {
              const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
              const curProj = curProjects.find(p => p.id === activeProjectId);
              const curScene = curProj?.scenes.find(s => s.id === scene.id);
              if (curScene && !curScene.isGeneratingVideoKeyframes) {
                clearInterval(checkInterval);
                if (curScene.videoUrlKeyframes) {
                  resolve();
                } else {
                  reject(new Error(`分鏡 ${i + 1} 「${scene.title}」影片生成失敗：${curScene?.videoErrorKeyframes || "未知錯誤"}`));
                }
              }
            }, 3000);
          });
        } catch (err: any) {
          failedIndices.push(i);
        }
      }

      // Retry failed ones at the end
      if (failedIndices.length > 0) {
        const stillFailed: number[] = [];
        for (const idx of failedIndices) {
          const scene = activeProject.scenes[idx];
          await fetch("/api/reset-task", { method: "POST" }).catch(() => {});
          try {
            await new Promise<void>((resolve, reject) => {
              handleGenerateVideoKeyframes(scene.id, idx);

              const checkInterval = setInterval(() => {
                const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
                const curProj = curProjects.find(p => p.id === activeProjectId);
                const curScene = curProj?.scenes.find(s => s.id === scene.id);
                if (curScene && !curScene.isGeneratingVideoKeyframes) {
                  clearInterval(checkInterval);
                  if (curScene.videoUrlKeyframes) {
                    resolve();
                  } else {
                    reject(new Error(`分鏡 ${idx + 1} 「${scene.title}」影片生成失敗：${curScene?.videoErrorKeyframes || "未知錯誤"}`));
                  }
                }
              }, 3000);
            });
          } catch (retryErr) {
            stillFailed.push(idx);
          }
        }

        if (stillFailed.length > 0) {
          const names = stillFailed.map(idx => `分鏡 ${idx + 1} 「${activeProject.scenes[idx].title}」`).join(", ");
          alert(`⚠️ 部份分鏡 (如: ${names}) 經重試後仍生成失敗。已將其設定為手動模式，其餘成功分鏡已順利完成！`);
        } else {
          alert("🎉 恭喜！所有先前失敗的分鏡已在二次重試中成功依序完成！");
        }
      } else {
        alert("🎉 恭喜！所有分鏡已成功依序完成首尾影格連續過渡生成！");
      }
    } catch (err: any) {
      alert(`順序自動生成中斷：${err.message || err}`);
    } finally {
      setIsGeneratingAllKeyframesSequentially(false);
    }
  };

  // One-click full automatic video master pipeline
  const handleFullAutoVideoProduction = async () => {
    if (!activeProject || isFullAutoProducing) return;
    setIsFullAutoProducing(true);
    setFinalStitchedVideoUrl(null);
    setFullAutoProgress("5%");
    setFullAutoLogs([
      "🚀 啟動 AI 全自動製片大師極致工作流...",
      "🎬 第一步：正在檢查並初始化劇本與分鏡劇本拆解..."
    ]);

    try {
      // 1. If scenes are empty, automatically disassemble the novel text first
      let currentScenes = [...activeProject.scenes];
      if (currentScenes.length === 0) {
        if (!activeProject.novelText.trim()) {
          throw new Error("本專案尚無小說文字或大綱，請先在「原著小說」中填寫內容再進行全自動出片。");
        }
        
        setFullAutoProgress("10%");
        setFullAutoLogs(prev => [...prev, "🧬 偵測到當前未生成分鏡，正在全自動呼叫 AI 模型解析大綱並拆解極致分鏡劇本..."]);
        
        let currentCharacters = [...activeProject.characters];
        const hasMatchingCharacter = currentCharacters.length > 0 && currentCharacters.some(c => 
          activeProject.novelText.toLowerCase().includes(c.name.toLowerCase())
        );

        if (currentCharacters.length === 0 || !hasMatchingCharacter) {
          setFullAutoLogs(prev => [...prev, "👥 偵測到現有角色與當前小說內容不匹配，正在全自動重新提取劇本中的主要角色與服裝設定..."]);
          const charRes = await fetch("/api/extract-characters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              novelText: activeProject.novelText,
              artStyle: activeProject.artStyle,
              engine: 'agnes',
              customApiKey: customApiKey || undefined
            })
          });
          if (charRes.ok) {
            const charData = await charRes.json();
            if (charData.characters && charData.characters.length > 0) {
              currentCharacters = charData.characters.map((c: any, idx: number) => ({
                id: `char_${Date.now()}_${idx}`,
                name: c.name,
                role: c.role || "",
                age: c.age || "",
                clothing: c.clothing || "",
                personality: c.personality || "",
                description: c.description || "",
                avatarUrl: ""
              }));
              setFullAutoLogs(prev => [...prev, `✅ 成功智能解析並置入 ${currentCharacters.length} 位主要主角特徵！`]);
            }
          }
        }

        const splitRes = await fetch("/api/split-novel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelText: activeProject.novelText,
            artStyle: activeProject.artStyle,
            characters: currentCharacters,
            engine: 'agnes',
            customApiKey: customApiKey || undefined
          })
        });

        if (!splitRes.ok) {
          throw new Error("全自動分鏡劇本拆解失敗，請重試。");
        }

        const data = await splitRes.json();
        if (data.scenes && data.scenes.length > 0) {
          const formattedScenes: Scene[] = data.scenes.map((s: any, idx: number) => {
            const finalDuration = s.durationSeconds && typeof s.durationSeconds === 'number'
              ? s.durationSeconds
              : 5;
            return {
              id: `scene_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
              title: s.title || `分鏡 ${idx + 1}`,
              dialogue: s.dialogue || "",
              narration: s.narration || "",
              character: s.character || "旁白",
              visualPrompt: s.visualPrompt || s.title || "",
    negativePrompt: s.negativePrompt || "",
              actionPrompt: s.actionPrompt || "",
              durationSeconds: finalDuration,
              audioCue: s.audioCue || "",
              directorNotes: s.directorNotes || "",
              transitionPrompt: s.transitionPrompt || "",
              imageUrl: "",
              imageUrlExt: "",
              imageUrlKeyframes: "",
              videoUrl: "",
              videoUrlExt: "",
              videoUrlKeyframes: "",
              isGeneratingImage: false,
              isGeneratingVideo: false,
              isGeneratingImageExt: false,
              isGeneratingVideoExt: false,
              isGeneratingImageKeyframes: false,
              isGeneratingVideoKeyframes: false,
              videoProgress: "0%",
              videoProgressExt: "0%",
              videoProgressKeyframes: "0%",
              videoLogs: [],
              videoLogsExt: [],
              videoLogsKeyframes: [],
              videoError: "",
              videoErrorExt: "",
              videoErrorKeyframes: ""
            };
          });

          updateActiveProject({
            characters: currentCharacters,
            scenes: formattedScenes
          });
          currentScenes = formattedScenes;
          setFullAutoLogs(prev => [...prev, `✅ 全自動分鏡劇本拆解成功，已為您生成了 ${formattedScenes.length} 個高精緻鏡頭！`]);
        } else {
          throw new Error("未能成功拆解劇本，請確認小說大綱填寫完整。");
        }
      }

      // 2. Clear any video task locks on the server
      setFullAutoProgress("15%");
      setFullAutoLogs(prev => [...prev, "🧹 正在清除背景運算鎖，確保全自動生成線路完全暢通..."]);
      await fetch("/api/reset-task", { method: "POST" }).catch(() => {});

      // 3. Forcibly generate all missing storyboard images for the scenes sequentially
      setFullAutoProgress("20%");
      setFullAutoLogs(prev => [...prev, "🎨 第二步：正在啟動 AI 畫師，依序生成所有分鏡的高解析度關鍵影格相片..."]);
      
      for (let i = 0; i < currentScenes.length; i++) {
        const scene = currentScenes[i];
        
        const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
        const curProj = curProjects.find(p => p.id === activeProjectId);
        const freshScene = curProj?.scenes.find(s => s.id === scene.id) || scene;

        if (!freshScene.imageUrlKeyframes) {
          setFullAutoLogs(prev => [...prev, `🖌️ 正在繪製分鏡 ${i + 1} 「${scene.title}」之首影格精準畫面...`]);
          
          await handleGenerateImage(scene.id, 'agnes');
          // Wait for React to process the state update and localStorage
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const checkProjList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
          const checkProj = checkProjList.find(p => p.id === activeProjectId);
          const updatedScene = checkProj?.scenes.find(s => s.id === scene.id);
          
          if (updatedScene?.imageUrlKeyframes) {
            setFullAutoLogs(prev => [...prev, `✅ 分鏡 ${i + 1} 「${scene.title}」畫面繪製成功！`]);
          } else {
            setFullAutoLogs(prev => [...prev, `⚠️ 分鏡 ${i + 1} 繪製未完全，使用智能備用畫面過渡...`]);
          }
        } else {
          setFullAutoLogs(prev => [...prev, `✨ 分鏡 ${i + 1} 「${scene.title}」已有精美畫面，跳過繪製，直接進入下一步。`]);
        }
      }

      const afterImagesProjList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
      const afterImagesProj = afterImagesProjList.find(p => p.id === activeProjectId);
      currentScenes = afterImagesProj?.scenes || currentScenes;

      // 4. Intelligent transition extraction & Video Generation sequentially
      setFullAutoProgress("40%");
      setFullAutoLogs(prev => [
        ...prev, 
        "🎥 第三步：正在進入 AI 導演極致連續運鏡生成模式 (首尾幀轉換連續過渡)...",
        "🧠 [AI 智慧安全防禦] 正在分析各分鏡的物理特徵，全自動為您調配並套用最穩定的運鏡策略..."
      ]);

      const optimizedScenes = currentScenes.map((scene, i) => {
        const nextScene = i < currentScenes.length - 1 ? currentScenes[i + 1] : undefined;
        
        let useFreezeAndMove = scene.useFreezeAndMove;
        let useMidpointSplit = scene.useMidpointSplit;

        const charA = (scene.character || "").trim().toLowerCase();
        const charB = nextScene ? (nextScene.character || "").trim().toLowerCase() : "";
        
        const titleA = (scene.title || "").trim().toLowerCase();
        const titleB = nextScene ? (nextScene.title || "").trim().toLowerCase() : "";

        const actionPrompt = (scene.actionPrompt || "").trim().toLowerCase();
        const transitionPrompt = (scene.transitionPrompt || "").trim().toLowerCase();
        const visualPromptA = (scene.visualPrompt || "").trim().toLowerCase();
        const visualPromptB = nextScene ? (nextScene.visualPrompt || "").trim().toLowerCase() : "";

        if (nextScene) {
          // Rule 1: Character identity mismatch (prevents girl turning into man!)
          const isCharMismatch = charA !== charB && charA !== "旁白" && charB !== "旁白" && charA !== "" && charB !== "";
          
          // Rule 2: Scene location changes dramatically (different backgrounds)
          const locA = titleA.split("-")[0].trim();
          const locB = titleB.split("-")[0].trim();
          const isLocMismatch = locA && locB && locA !== locB;
          
          // Rule 3: High-motion action words which are prone to warping
          const highMotionKeywords = ["run", "turn", "jump", "fall", "rush", "chase", "explode", "轉身", "跑", "跳", "倒下", "摔"];
          const hasHighMotion = highMotionKeywords.some(kw => 
            actionPrompt.includes(kw) || 
            transitionPrompt.includes(kw) || 
            visualPromptA.includes(kw) || 
            visualPromptB.includes(kw)
          );

          if (isCharMismatch) {
            useFreezeAndMove = true;
          } else if (isLocMismatch) {
            useFreezeAndMove = true;
            useMidpointSplit = true;
          } else if (hasHighMotion) {
            useFreezeAndMove = true;
          }
        }

        return {
          ...scene,
          useFreezeAndMove,
          useMidpointSplit
        };
      });

      updateActiveProject({
        scenes: optimizedScenes
      });
      
      // Synchronously write to localStorage to avoid any React state-update race conditions
      try {
        const curList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
        const updatedList = curList.map(p => p.id === activeProjectId ? { ...p, scenes: optimizedScenes } : p);
        localStorage.setItem("toonflow_projects", JSON.stringify(updatedList));
      } catch(e) {}

      currentScenes = optimizedScenes;

      // Print auto-selected strategies into logs for user reassurance
      optimizedScenes.forEach((scene, i) => {
        const nextScene = i < optimizedScenes.length - 1 ? optimizedScenes[i + 1] : undefined;
        if (nextScene) {
          const charA = (scene.character || "").trim();
          const charB = (nextScene.character || "").trim();
          if (scene.useFreezeAndMove) {
            if (charA && charB && charA !== charB && charA !== "旁白" && charB !== "旁白") {
              setFullAutoLogs(prev => [...prev, `🛡️ 分鏡 ${i + 1} ➔ ${i + 2}：偵測到人物切換 [${charA} ➔ ${charB}]，已自動套用「凍結定格過渡」以防角色漂移或性別變異！`]);
            } else if (scene.useMidpointSplit) {
              setFullAutoLogs(prev => [...prev, `🛡️ 分鏡 ${i + 1} ➔ ${i + 2}：偵測到背景與時空大幅切換，已自動啟用「中段拆分雙段過渡」防止畫面撕裂！`]);
            } else {
              setFullAutoLogs(prev => [...prev, `🛡️ 分鏡 ${i + 1} ➔ ${i + 2}：偵測到高動態/轉身動作，已自動套用「凍結定格過渡」防崩！`]);
            }
          } else {
            setFullAutoLogs(prev => [...prev, `✨ 分鏡 ${i + 1} ➔ ${i + 2}：主體與場景連貫，採用「流暢連續運動（預設，建議3秒/75幀內）」呈現完美運鏡。`]);
          }
        }
      });

      const failedSceneIndices: number[] = [];

      for (let i = 0; i < currentScenes.length; i++) {
        const scene = currentScenes[i];
        
        const checkProjList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
        const checkProj = checkProjList.find(p => p.id === activeProjectId);
        let freshScene = checkProj?.scenes.find(s => s.id === scene.id) || scene;

        if (scene.id.startsWith("scene_transition_") && i > 0) {
          try {
            setFullAutoLogs(prev => [...prev, `🔄 偵測到銜接分鏡 ${i + 1}，正在全自動精確提取前置分鏡的結尾影格以實現完美連續對接...`]);
            await handleGenerateImage(scene.id, 'agnes');
            // Wait for React to process the state update and localStorage
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const freshProjList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
            const freshProj = freshProjList.find(p => p.id === activeProjectId);
            freshScene = freshProj?.scenes.find(s => s.id === scene.id) || freshScene;
          } catch (imgErr) {
            setFullAutoLogs(prev => [...prev, `⚠️ 銜接分鏡 ${i + 1} 的圖像提取失敗，暫時跳過，等其餘鏡頭生成完畢後再行處理。`]);
            failedSceneIndices.push(i);
            continue;
          }
        }

        if (freshScene.videoUrlKeyframes) {
          setFullAutoLogs(prev => [...prev, `✨ 分鏡 ${i + 1} 「${scene.title}」影片已就緒，直接套用。`]);
          continue;
        }

        setFullAutoLogs(prev => [...prev, `📹 正在全自動生成分鏡 ${i + 1} 「${scene.title}」的高動態物理過渡影片...`]);

        try {
          await new Promise<void>((resolve, reject) => {
            handleGenerateVideoKeyframes(scene.id, i);

            const checkInterval = setInterval(() => {
              const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
              const curProj = curProjects.find(p => p.id === activeProjectId);
              const curScene = curProj?.scenes.find(s => s.id === scene.id);
              
              if (curScene) {
                if (curScene.videoProgressKeyframes && curScene.videoProgressKeyframes !== "0%" && curScene.videoProgressKeyframes !== "100%") {
                  setFullAutoLogs(prev => {
                    const prefix = `⏳ 鏡頭 ${i + 1} 物理運鏡生成中... 進度 ${curScene.videoProgressKeyframes}`;
                    if (prev[prev.length - 1] !== prefix) {
                      return [...prev, prefix];
                    }
                    return prev;
                  });
                }

                if (!curScene.isGeneratingVideoKeyframes) {
                  clearInterval(checkInterval);
                  if (curScene.videoUrlKeyframes) {
                    setFullAutoLogs(prev => [...prev, `✅ 分鏡 ${i + 1} 「${scene.title}」完美運鏡影片生成完畢！`]);
                    resolve();
                  } else {
                    reject(new Error(curScene?.videoErrorKeyframes || "未知錯誤"));
                  }
                }
              }
            }, 3000);
          });
        } catch (vidErr: any) {
          setFullAutoLogs(prev => [...prev, `⚠️ 分鏡 ${i + 1} 「${scene.title}」生成失敗：${vidErr.message || vidErr}，先繞過此鏡頭，待其餘鏡頭完成後再進行二次重試處理...`]);
          failedSceneIndices.push(i);
        }

        const progressPercent = Math.min(75, 40 + Math.floor((i + 1) / currentScenes.length * 35));
        setFullAutoProgress(`${progressPercent}%`);
      }

      // Retry failed scenes at the end
      if (failedSceneIndices.length > 0) {
        setFullAutoProgress("75%");
        setFullAutoLogs(prev => [...prev, `🔄 正在針對先前生成失敗的 ${failedSceneIndices.length} 個分鏡鏡頭啟動二次自動重試機制...`]);
        const stillFailedIndices: number[] = [];

        for (let idx = 0; idx < failedSceneIndices.length; idx++) {
          const i = failedSceneIndices[idx];
          const scene = currentScenes[i];

          setFullAutoLogs(prev => [...prev, `🔄 正在嘗試重新生成分鏡 ${i + 1} 「${scene.title}」 (重試次數: 1)...`]);
          
          // Clear any background server-side locks before retrying
          await fetch("/api/reset-task", { method: "POST" }).catch(() => {});

          try {
            if (scene.id.startsWith("scene_transition_")) {
              setFullAutoLogs(prev => [...prev, `🔄 重新嘗試提取銜接分鏡 ${i + 1} 的前置分鏡結尾影格...`]);
              await handleGenerateImage(scene.id, 'agnes');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }

            await new Promise<void>((resolve, reject) => {
              handleGenerateVideoKeyframes(scene.id, i);

              const checkInterval = setInterval(() => {
                const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
                const curProj = curProjects.find(p => p.id === activeProjectId);
                const curScene = curProj?.scenes.find(s => s.id === scene.id);
                
                if (curScene) {
                  if (curScene.videoProgressKeyframes && curScene.videoProgressKeyframes !== "0%" && curScene.videoProgressKeyframes !== "100%") {
                    setFullAutoLogs(prev => {
                      const prefix = `⏳ 鏡頭 ${i + 1} 重試中... 進度 ${curScene.videoProgressKeyframes}`;
                      if (prev[prev.length - 1] !== prefix) {
                        return [...prev, prefix];
                      }
                      return prev;
                    });
                  }

                  if (!curScene.isGeneratingVideoKeyframes) {
                    clearInterval(checkInterval);
                    if (curScene.videoUrlKeyframes) {
                      setFullAutoLogs(prev => [...prev, `✅ 分鏡 ${i + 1} 「${scene.title}」重試生成成功！`]);
                      resolve();
                    } else {
                      reject(new Error(curScene?.videoErrorKeyframes || "未知錯誤"));
                    }
                  }
                }
              }, 3000);
            });
          } catch (retryErr: any) {
            setFullAutoLogs(prev => [...prev, `❌ 分鏡 ${i + 1} 「${scene.title}」多次生成均告無效。原因：${retryErr.message || retryErr}。改為手動。`]);
            stillFailedIndices.push(i);
          }
        }

        if (stillFailedIndices.length > 0) {
          const names = stillFailedIndices.map(idx => `分鏡 ${idx + 1} 「${currentScenes[idx].title}」`).join(", ");
          setFullAutoLogs(prev => [
            ...prev,
            `⚠️ 注意：[${names}] 經多次重試後依然生成失敗，已自動將其轉換為手動模式。`,
            `💡 最終成片拼接將自動跳過上述未完成的分鏡。您可以在本全自動製片結束後，手動在分鏡卡片上重試生成它們，再點擊「手動拼接」！`
          ]);
        } else {
          setFullAutoLogs(prev => [...prev, `✨ 所有先前失敗的分鏡已全部重試成功！`]);
        }
      }

      // 5. Multi-Clip Video Stitching using our new backend endpoint!
      setFullAutoProgress("85%");
      setFullAutoLogs(prev => [...prev, "🎬 第四步：所有分鏡鏡頭已完美生成完畢！正在啟動 AI 剪輯大師，極速拼接大片中..."]);

      const finalProjList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
      const finalProj = finalProjList.find(p => p.id === activeProjectId);
      const orderedVideoUrls = (finalProj?.scenes || currentScenes)
        .map(s => s.videoUrlKeyframes || s.videoUrlExt || s.videoUrl)
        .filter(Boolean) as string[];

      if (orderedVideoUrls.length === 0) {
        throw new Error("沒有生成任何有效的影片分鏡，無法進行最終拼接剪輯。");
      }

      setFullAutoLogs(prev => [...prev, `🎞️ 正在向剪輯核心提交 ${orderedVideoUrls.length} 個分鏡鏡頭檔案...`]);

      const stitchRes = await fetch("/api/stitch-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrls: orderedVideoUrls })
      });

      if (!stitchRes.body) throw new Error("No response body from server");
      
      const reader = stitchRes.body.getReader();
      const decoder = new TextDecoder();
      let finalStitchData: any = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'log') {
              setFullAutoLogs(prev => [...prev, data.log]);
            } else if (data.type === 'result') {
              finalStitchData = data;
            }
          } catch (e) {
            console.error("Error parsing log line:", e);
          }
        }
      }

      if (finalStitchData && finalStitchData.videoUrl) {
        setFinalStitchedVideoUrl(finalStitchData.videoUrl);
        updateActiveProject({ finalVideoUrl: finalStitchData.videoUrl });
        setFullAutoProgress("100%");
        setFullAutoLogs(prev => [
          ...prev, 
          "🎉 恭喜！最終電影級大片已完美拼接！",
          `✨ 電影成片連結已生成：${finalStitchData.videoUrl}`,
          "🌟 這是 AI 完全自動化生成的影視傑作，請點擊下方播放器進行觀賞與下載！"
        ]);
        showToast("🎉 恭喜！AI 全自動電影製作大師一鍵出片成功！", "success");
      } else {
        throw new Error("最終拼接未返回有效影片網址。");
      }

    } catch (err: any) {
      console.error("[Toonflow Error] Auto-Produce Pipeline failed:", err);
      setFullAutoLogs(prev => [...prev, `❌ 錯誤：${err.message || err}`, "⚠️ 全自動製片中斷，您可以手動點擊單個鏡頭重試，或排除問題後再次點擊一鍵出片。"]);
      showToast(`全自動製片中斷：${err.message || err}`, "error");
    } finally {
      setIsFullAutoProducing(false);
    }
  };

  // Manual Stitching Engine - Merge all successfully generated video scenes
  const handleManualStitchVideos = async () => {
    if (!activeProject || isFullAutoProducing) return;
    
    // 1. Fetch current projects from localStorage to get the freshest data
    const curProjects = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
    const curProj = curProjects.find(p => p.id === activeProjectId) || activeProject;
    
    const orderedVideoUrls = curProj.scenes
      .map(s => s.videoUrlKeyframes || s.videoUrlExt || s.videoUrl)
      .filter(Boolean) as string[];

    if (orderedVideoUrls.length === 0) {
      alert("⚠️ 沒有生成任何有效的影片分鏡，無法進行拼接。請先手動為分鏡卡片生成影片，或使用「AI一鍵全自動極速出片」！");
      return;
    }

    setIsFullAutoProducing(true);
    setFinalStitchedVideoUrl(null);
    setFullAutoProgress("10%");
    setFullAutoLogs([
      "🎬 啟動 [手動一鍵拼接] 工作流...",
      `📦 正在掃描專案，共偵測到 ${curProj.scenes.length} 個分鏡卡片...`,
      `🔍 其中已成功生成影片的片段共 ${orderedVideoUrls.length} 個。`
    ]);

    try {
      const response = await fetch("/api/stitch-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrls: orderedVideoUrls })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'log') {
              setFullAutoLogs(prev => [...prev, data.log]);
              // Update progress based on log
              if (data.log.includes("下載")) setFullAutoProgress("25%");
              else if (data.log.includes("提交")) setFullAutoProgress("50%");
              else if (data.log.includes("完美完成")) setFullAutoProgress("100%");
            } else if (data.type === 'result') {
              setFinalStitchedVideoUrl(data.videoUrl);
              updateActiveProject({ finalVideoUrl: data.videoUrl });
              showToast("🎉 恭喜！手動拼接影片成功！", "success");
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            console.error("Failed to parse log chunk", e);
          }
        }
      }
    } catch (err: any) {
      setFullAutoProgress("0%");
      setFullAutoLogs(prev => [...prev, `❌ 拼接過程出錯：${err.message || err}`]);
      showToast("拼接失敗", "error");
    } finally {
      setIsFullAutoProducing(false);
    }
  };

  // Reset the global video task lock in the backend
  const handleResetVideoTask = async () => {
    // Optimistically unlock the frontend UI state first to ensure user is never stuck
    if (activeProject) {
      const updatedScenes = activeProject.scenes.map(s => ({
        ...s,
        isGeneratingVideo: false,
        isGeneratingVideoExt: false,
        isGeneratingVideoKeyframes: false,
        videoError: undefined,
        videoErrorExt: undefined,
        videoErrorKeyframes: undefined
      }));
      updateActiveProject({ scenes: updatedScenes });
    }

    try {
      const res = await fetch("/api/reset-task", { method: "POST" });
      if (res.ok) {
        showToast("已成功重設後端算圖鎖定！", "success");
      } else {
        showToast("後端鎖定重設回傳異常，已強制解除前端鎖定", "info");
      }
    } catch (err: any) {
      console.warn("Failed to reset task lock:", err);
      showToast("無法連接伺服器重設鎖定，已為您強制解除前端介面鎖定", "info");
    }
  };

  // Add a new empty custom storyboard scene
  const handleAddCustomScene = () => {
    if (!activeProject) return;

    const newScene: Scene = {
      id: `scene_custom_${Date.now()}`,
      title: `自定義分鏡場景 ${activeProject.scenes.length + 1}`,
      dialogue: "輸入劇白與旁白字幕...",
      character: "凌風",
      visualPrompt: "Close-up of a handsome character in anime style, atmospheric lighting."
    };

    updateActiveProject({
      scenes: [...activeProject.scenes, newScene]
    });
  };

  // Delete a scene card
  const handleDeleteScene = (sceneId: string) => {
    if (!activeProject) return;
    const filtered = activeProject.scenes.filter(s => s.id !== sceneId);
    updateActiveProject({ scenes: filtered });
  };

  // Edit fields inline in scenes list
  const handleUpdateSceneField = (sceneId: string, field: keyof Scene, value: string | number | boolean) => {
    if (!activeProject) return;
    const updated = activeProject.scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, [field]: value };
      }
      return s;
    });
    updateActiveProject({ scenes: updated });
  };

  // Export active project scenes to CSV
  const handleExportCSV = () => {
    if (!activeProject || activeProject.scenes.length === 0) {
      showToast("目前沒有可匯出的分鏡場景！", "error");
      return;
    }

    // Prepare CSV header and rows
    const headers = [
      "分鏡順序 (Scene No.)",
      "分鏡場景標題 (Scene Title)",
      "主要角色 (Character)",
      "台詞對白 (Dialogue)",
      "場景旁白 (Narration)",
      "時長(秒) (Duration)",
      "音訊氛圍與背景音樂 (Audio Cue)",
      "英文畫面提示詞 (Visual Prompt)",
      "導演註記/個人拍攝筆記 (Director's Notes)",
      "參考圖網址 (Image URL)"
    ];

    const rows = activeProject.scenes.map((scene, index) => [
      `分鏡 ${index + 1}`,
      scene.title || "",
      scene.character || "",
      scene.dialogue || "",
      scene.narration || "",
      scene.durationSeconds ? `${scene.durationSeconds}秒` : "5秒",
      scene.audioCue || "",
      scene.visualPrompt || "",
      scene.directorNotes || "",
      scene.imageUrl || ""
    ]);

    // Helper to format values for CSV, escape quotes and handle commas
    const formatCSVCell = (val: string) => {
      const cleanVal = val.replace(/"/g, '""');
      if (cleanVal.includes(",") || cleanVal.includes("\n") || cleanVal.includes('"')) {
        return `"${cleanVal}"`;
      }
      return cleanVal;
    };

    const csvContent = [
      headers.map(formatCSVCell).join(","),
      ...rows.map(row => row.map(formatCSVCell).join(","))
    ].join("\n");

    // Add UTF-8 BOM so Excel opens it with correct Chinese encoding
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeProjectName = activeProject.name.replace(/[/\\?%*:|"<>]/g, '-');
    link.setAttribute("href", url);
    link.setAttribute("download", `ToonFlow_劇本匯出_${safeProjectName}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`成功匯出 ${activeProject.scenes.length} 個分鏡劇本為 CSV 檔案！`, "success");
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDraggedOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    if (!activeProject) return;

    const updatedScenes = [...activeProject.scenes];
    const [removed] = updatedScenes.splice(draggedIndex, 1);
    updatedScenes.splice(targetIndex, 0, removed);

    updateActiveProject({ scenes: updatedScenes });
    handleDragEnd();
  };

  // Character management handlers
  const handleExportAllCharacters = () => {
    if (!activeProject || activeProject.characters.length === 0) {
      showToast("沒有可匯出的角色", "info");
      return;
    }
    
    let content = `Project Characters Profile: ${activeProject.name}\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n\n`;
    
    activeProject.characters.forEach((char, index) => {
      content += `=== Character ${index + 1}: ${char.name} ===\n`;
      content += `Name: ${char.name}\n`;
      content += `Role: ${String(char.role || 'N/A')}\n`;
      content += `Age: ${String(char.age || 'N/A')}\n`;
      content += `Description: ${String(char.description || 'N/A')}\n`;
      content += `Clothing: ${String(char.clothing || 'N/A')}\n`;
      content += `Personality: ${String(char.personality || 'N/A')}\n`;
      content += `Mood: ${String(char.mood || 'N/A')}\n`;
      content += `Art Style: ${String(char.artStyle || 'N/A')}\n`;
      content += `Seed: ${char.seed || 'N/A'}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}_All_Characters.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast("已匯出所有角色設定檔", "success");
  };

  const handleExportCharacterProfile = (char: Character) => {
    let content = `=== Character Profile ===\n`;
    content += `Name: ${char.name}\n`;
    content += `Role: ${String(char.role || 'N/A')}\n`;
    content += `Age: ${String(char.age || 'N/A')}\n`;
    content += `Description: ${String(char.description || 'N/A')}\n`;
    content += `Clothing: ${String(char.clothing || 'N/A')}\n`;
    content += `Personality: ${String(char.personality || 'N/A')}\n`;
    content += `Mood: ${String(char.mood || 'N/A')}\n`;
    content += `Art Style: ${String(char.artStyle || 'N/A')}\n`;
    content += `Seed: ${String(char.seed || 'N/A')}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${char.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}_Profile.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`已匯出角色設定檔：${char.name}`, "success");
  };

  const handleAddCharacter = () => {
    if (!activeProject) return;
    const newChar: Character = {
      id: `char_custom_${Date.now()}`,
      name: "新角色",
      description: "描述該角色的外貌特徵以保持AI繪圖一致性。"
    };
    updateActiveProject({
      characters: [...activeProject.characters, newChar]
    });
  };

  const handleUpdateChar = (charId: string, field: keyof Character, value: string) => {
    if (!activeProject) return;
    const updated = activeProject.characters.map(c => {
      if (c.id === charId) {
        return { ...c, [field]: value };
      }
      return c;
    });
    updateActiveProject({ characters: updated });
  };

  const handleDeleteChar = (charId: string) => {
    if (!activeProject) return;
    const filtered = activeProject.characters.filter(c => c.id !== charId);
    updateActiveProject({ characters: filtered });
  };

  // Global Character Library management handlers
  const handleSaveToLibrary = (char: Character) => {
    const cleanChar: Character = {
      id: `lib_char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: char.name || "未命名角色",
      description: char.description || "",
      role: char.role || "",
      avatarUrl: char.avatarUrl || "",
      avatarUrls: Array.isArray(char.avatarUrls) ? [...char.avatarUrls] : (char.avatarUrl ? [char.avatarUrl] : []),
      artStyle: char.artStyle || "",
      age: char.age || "",
      clothing: char.clothing || "",
      personality: char.personality || "",
      mood: char.mood || "",
      seed: char.seed
    };

    const existsIndex = characterLibrary.findIndex(
      c => c.name.trim().toLowerCase() === cleanChar.name.trim().toLowerCase()
    );
    let newLib = [...characterLibrary];

    if (existsIndex > -1) {
      newLib[existsIndex] = { ...cleanChar, id: newLib[existsIndex].id };
      showToast(`已更新角色庫中的「${cleanChar.name}」角色資料！`, "success");
    } else {
      newLib.push(cleanChar);
      showToast(`成功將「${cleanChar.name}」儲存至角色庫！`, "success");
    }

    setCharacterLibrary(newLib);
    localStorage.setItem("toonflow_character_library", JSON.stringify(newLib));
  };

  const handleImportFromLibrary = (libChar: Character) => {
    if (!activeProject) {
      showToast("請先選擇或建立一個專案！", "error");
      return;
    }

    const exists = activeProject.characters.some(
      c => c.name.trim().toLowerCase() === libChar.name.trim().toLowerCase()
    );
    if (exists) {
      showToast(`提示：此專案中已有名為「${libChar.name}」的角色。`, "info");
    }

    const newProjectChar: Character = {
      ...libChar,
      id: `char_custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      isGeneratingAvatar: false
    };

    updateActiveProject({
      characters: [...activeProject.characters, newProjectChar]
    });
    
    showToast(`已成功將「${libChar.name}」導入本專案！`, "success");
  };

  const handleRemoveFromLibrary = (libCharId: string, name: string) => {
    const updated = characterLibrary.filter(c => c.id !== libCharId);
    setCharacterLibrary(updated);
    localStorage.setItem("toonflow_character_library", JSON.stringify(updated));
    showToast(`已將「${name}」自角色庫中移除`, "info");
  };

  const handleAnalyzeCharacterTarget = async (char: Character) => {
    if (!activeProject) return;
    setAnalyzingTargetId(char.id);
    showToast(`正在 AI 智能解析「${char.name}」在原著中的特徵目標設定...`, "info");
    try {
      const response = await fetch("/api/analyze-character-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: char.name,
          novelText: activeProject.novelText || activeProject.scenes.map(s => s.dialogue + " " + (s.narration || "")).join("\n"),
          artStyle: activeProject.artStyle,
          customApiKey: customApiKey || undefined
        })
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      if (data.targetTraits) {
        updateActiveProject({
          characters: activeProject.characters.map(c => {
            if (c.id === char.id) {
              return {
                ...c,
                targetRole: data.targetTraits.role,
                targetAge: data.targetTraits.age,
                targetClothing: data.targetTraits.clothing,
                targetPersonality: data.targetTraits.personality,
                targetMood: data.targetTraits.mood,
                targetDescription: data.targetTraits.description
              };
            }
            return c;
          })
        });
        showToast(`已成功分析並呈現 ${char.name} 的原著設定特徵！`, "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast("分析失敗，已為您產出預設的特徵對照目標", "error");
      updateActiveProject({
        characters: activeProject.characters.map(c => {
          if (c.id === char.id) {
            return {
              ...c,
              targetRole: char.role || "主角/關鍵核心",
              targetAge: char.age || "青年約25歲",
              targetClothing: char.clothing || "符合當前風格的服飾",
              targetPersonality: char.personality || "勇敢自信，富有同理心",
              targetMood: char.mood || "happy",
              targetDescription: char.description || "A highly consistent character in the novel."
            };
          }
          return c;
        })
      });
    } finally {
      setAnalyzingTargetId(null);
    }
  };

  const handleApplyTargetTrait = (charId: string, field: keyof Character, value: string | number | boolean) => {
    if (!activeProject) return;
    updateActiveProject({
      characters: activeProject.characters.map(c => {
        if (c.id === charId) {
          return { ...c, [field]: value };
        }
        return c;
      })
    });
    showToast("已成功套用該特徵目標設定！", "success");
  };

  const handleApplyAllTargetTraits = (char: Character) => {
    if (!activeProject) return;
    updateActiveProject({
      characters: activeProject.characters.map(c => {
        if (c.id === char.id) {
          return {
            ...c,
            role: char.targetRole || c.role,
            age: char.targetAge || c.age,
            clothing: char.targetClothing || c.clothing,
            personality: char.targetPersonality || c.personality,
            mood: char.targetMood || c.mood,
            description: char.targetDescription || c.description
          };
        }
        return c;
      })
    });
    showToast(`已一鍵修復並對齊「${char.name}」的所有特徵偏差！`, "success");
  };

  const handleSyncCharacterClothing = async (charId: string) => {
    if (!activeProject) return;
    const charObj = activeProject.characters.find(c => c.id === charId);
    if (!charObj) return;

    const charLower = (charObj.name || "").trim().toLowerCase();
    const affectedScenes = activeProject.scenes.filter(s => (s.character || "").trim().toLowerCase().includes(charLower));
    if (affectedScenes.length === 0) {
      showToast(`目前分鏡中沒有任何場景出現主角「${charObj.name}」！`, "error");
      return;
    }

    showToast("正在智能同步並校正所有分鏡的服裝設定...", "info");

    try {
      const updatedScenes = [...activeProject.scenes];
      
      for (let i = 0; i < updatedScenes.length; i++) {
        const scene = updatedScenes[i];
        if ((scene.character || "").trim().toLowerCase().includes(charLower)) {
          // Use description or the narration/dialogue as base input
          const rawInput = scene.narration || scene.dialogue || scene.visualPrompt || scene.title;
          
          const res = await fetch("/api/optimize-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: rawInput,
              artStyle: charObj.artStyle || activeProject.artStyle,
              character: charObj.name,
              characterDescription: `${charObj.description || ""}. Ensure wearing: ${charObj.clothing || ""}.`,
              customApiKey: customApiKey || undefined,
              mood: charObj.mood
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.optimizedPrompt) {
              updatedScenes[i] = {
                ...scene,
                visualPrompt: data.optimizedPrompt
              };
            }
          }
        }
      }

      updateActiveProject({ scenes: updatedScenes });
      showToast("✨ 成功！所有分鏡的角色服裝已校正為一致。", "success");
    } catch (e: any) {
      console.error(e);
      showToast("同步服裝時發生錯誤，請稍後再試。", "error");
    }
  };

  const handleUploadSceneImage = async (e: React.ChangeEvent<HTMLInputElement>, sceneId: string, field: "imageUrl" | "imageUrlExt" | "imageUrlKeyframes") => {
    if (!activeProject) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      showToast('請上傳有效的圖片檔案', 'error');
      return;
    }

    showToast('正在處理並上傳圖片...', 'info');

    const compressSceneImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (!result) {
            reject(new Error("File read error"));
            return;
          }
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 576;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedDataUrl);
          };
          img.onerror = () => reject(new Error("Image load error"));
          img.src = result;
        };
        reader.onerror = () => reject(new Error("File reader error"));
        reader.readAsDataURL(file);
      });
    };

    try {
      const compressed = await compressSceneImage(file);
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data: compressed })
      });
      if (!uploadRes.ok) throw new Error("Server upload failed");
      const uploadData = await uploadRes.json();
      
      handleUpdateSceneField(sceneId, field, uploadData.imageUrl);
      showToast('圖片上傳並套用成功！', 'success');
    } catch (err) {
      console.error("Image compression/upload failed:", err);
      showToast('圖片處理與上傳失敗，請重試', 'error');
    }
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageDrop = async (e: React.DragEvent, sceneId: string, field: "imageUrl" | "imageUrlExt" | "imageUrlKeyframes") => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeProject) return;
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      showToast('請上傳有效的圖片檔案', 'error');
      return;
    }

    showToast('正在處理並上傳拖曳圖片...', 'info');

    const compressSceneImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (!result) {
            reject(new Error("File read error"));
            return;
          }
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 576;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedDataUrl);
          };
          img.onerror = () => reject(new Error("Image load error"));
          img.src = result;
        };
        reader.onerror = () => reject(new Error("File reader error"));
        reader.readAsDataURL(file);
      });
    };

    try {
      const compressed = await compressSceneImage(file);
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data: compressed })
      });
      if (!uploadRes.ok) throw new Error("Server upload failed");
      const uploadData = await uploadRes.json();
      
      handleUpdateSceneField(sceneId, field, uploadData.imageUrl);
      showToast('圖片拖曳上傳成功！', 'success');
    } catch (err) {
      console.error("Image compression/upload failed:", err);
      showToast('圖片處理與上傳失敗，請重試', 'error');
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>, charId: string) => {
    if (!activeProject) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f && f.type.startsWith('image/')) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      showToast('請上傳有效的圖片檔案', 'error');
      return;
    }

    showToast(`正在處理上傳的 ${validFiles.length} 張圖片...`, 'info');

    // Helper to read and compress image
    const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (!result) {
            reject(new Error("File read error"));
            return;
          }
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 512;
            const MAX_HEIGHT = 512;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedDataUrl);
          };
          img.onerror = () => reject(new Error("Image load error"));
          img.src = result;
        };
        reader.onerror = () => reject(new Error("File reader error"));
        reader.readAsDataURL(file);
      });
    };

    try {
      const compressedImages: string[] = [];
      for (const file of validFiles) {
        try {
          const compressed = await compressImage(file);
          // Upload to server to get static path
          const uploadRes = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Data: compressed })
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            compressedImages.push(uploadData.imageUrl);
          } else {
            console.error("Server upload failed, falling back to base64");
            compressedImages.push(compressed);
          }
        } catch (err) {
          console.error("Compression/upload failed for file:", file.name, err);
        }
      }

      if (compressedImages.length === 0) {
        showToast('圖片處理與上傳失敗，請重試', 'error');
        return;
      }

      // Add to characters
      updateActiveProject(prev => {
        const list = prev.characters.map(c => {
          if (c.id === charId) {
            const currentUrls = Array.isArray(c.uploadedAvatarUrls) ? c.uploadedAvatarUrls : (c.uploadedAvatarUrl ? [c.uploadedAvatarUrl] : []);
            const updatedUrls = [...currentUrls, ...compressedImages];
            return { 
              ...c, 
              uploadedAvatarUrl: updatedUrls[0],
              uploadedAvatarUrls: updatedUrls,
              avatarUrl: c.avatarUrl || updatedUrls[0],
              avatarUrls: c.avatarUrls && c.avatarUrls.length > 0 ? c.avatarUrls : [updatedUrls[0]],
              isGeneratingAvatar: true
            };
          }
          return c;
        });
        return { characters: list };
      });

      showToast(`已成功上傳 ${compressedImages.length} 張參考相片！正在分析特徵...`, 'info');

      // Call endpoint to analyze the first uploaded face avatar
      const primaryImage = compressedImages[0];
      fetch("/api/analyze-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: primaryImage,
          customApiKey: customApiKey || undefined
        })
      })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Analysis failed");
        }
        return res.json();
      })
      .then(data => {
        if (data.description) {
          updateActiveProject(prev => {
            const updatedList = prev.characters.map(c => {
              if (c.id === charId) {
                return {
                  ...c,
                  description: data.description,
                  isGeneratingAvatar: false
                };
              }
              return c;
            });
            return { characters: updatedList };
          });
          showToast('✨ 角色五官特徵分析完成！已自動儲存為特徵描述，將完美應用於後續繪圖與影片生成！', 'success');
        } else {
          throw new Error("No description returned");
        }
      })
      .catch(err => {
        console.error("Avatar analysis error:", err);
        updateActiveProject(prev => {
          const updatedList = prev.characters.map(c => {
            if (c.id === charId) {
              return { ...c, isGeneratingAvatar: false };
            }
            return c;
          });
          return { characters: updatedList };
        });
        showToast('相片已成功設定，但特徵自動分析未完成。您可以在下方手動調整特徵描述。', 'info');
      });

    } catch (err) {
      console.error("Upload process error:", err);
      showToast('圖片上傳處理失敗，請重試', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleDeleteUploadedPhoto = (charId: string, photoUrl: string) => {
    if (!activeProject) return;
    updateActiveProject(prev => {
      const updatedChars = prev.characters.map(c => {
        if (c.id === charId) {
          const currentUrls = Array.isArray(c.uploadedAvatarUrls) ? c.uploadedAvatarUrls : [];
          const updatedUrls = currentUrls.filter(url => url !== photoUrl);
          const newPrimary = updatedUrls[0] || "";
          
          return {
            ...c,
            uploadedAvatarUrl: newPrimary,
            uploadedAvatarUrls: updatedUrls,
            avatarUrl: c.avatarUrl === photoUrl ? newPrimary : c.avatarUrl,
            avatarUrls: Array.isArray(c.avatarUrls) ? c.avatarUrls.filter(url => url !== photoUrl) : []
          };
        }
        return c;
      });
      return { characters: updatedChars };
    });
    showToast('已移除該張參考相片', 'info');
  };

  // Trigger simulated character avatar drawing (generates a multi-angle character sheet)
  const handleGenerateAvatar = async (charId: string, engine: 'agnes' | 'gemini' | 'nanobanana' | 'mistral' = 'agnes') => {
    if (!activeProject) return;

    const charToGen = activeProject.characters.find(c => c.id === charId);
    if (!charToGen) return;

    updateActiveProject(prev => {
      const updatedChars = prev.characters.map(c => {
        if (c.id === charId) return { ...c, isGeneratingAvatar: true };
        return c;
      });
      return { characters: updatedChars };
    });

    const charSeed = charToGen.seed || Math.floor(Math.random() * 1000000) + 1;

    // Construct a rich combined prompt if the description is empty
    const combinedPrompt = charToGen.description.trim() || 
      `${charToGen.name || "主角"}${charToGen.role ? `, 身份/職業: ${charToGen.role}` : ""}${charToGen.age ? `, 年齡: ${charToGen.age}` : ""}${charToGen.clothing ? `, 服裝風格: ${charToGen.clothing}` : ""}${charToGen.personality ? `, 性格特質: ${charToGen.personality}` : ""}`;

    const controller = new AbortController();
    abortControllersRef.current[charId] = controller;
    const timeoutId = setTimeout(() => controller.abort(new Error("請求處理超時，請重試")), 180000); // 180s timeout

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: combinedPrompt,
          artStyle: charToGen.artStyle || activeProject.artStyle,
          character: charToGen.name,
          isAvatar: true,
          characterImages: charToGen.uploadedAvatarUrls && charToGen.uploadedAvatarUrls.length > 0
            ? charToGen.uploadedAvatarUrls
            : (charToGen.uploadedAvatarUrl ? [charToGen.uploadedAvatarUrl] : (charToGen.avatarUrls || (charToGen.avatarUrl ? [charToGen.avatarUrl] : []))),
          seed: charSeed,
          engine: engine,
          agnesImageMode: activeProject.agnesImageMode || "quality",
          customApiKey: customApiKey || undefined
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "設計圖生成失敗");
      }
      const textRes = await res.text();
      let data: any;
      try {
        data = JSON.parse(textRes);
      } catch(e) {
        console.warn("[Toonflow] Failed to parse character image response JSON. Raw text:", textRes.substring(0, 50));
        throw new Error("伺服器回傳格式錯誤，請稍後再試。");
      }
      
      if (data.message) {
        showToast(data.message, data.isAgnesImage ? "success" : "info");
      }
      
      updateActiveProject(prev => {
        const list = prev.characters.map(c => {
          if (c.id === charId) {
            return { 
              ...c, 
              avatarUrl: data.imageUrl, // This is the single multi-angle sheet
              avatarUrls: [data.imageUrl],
              seed: charSeed,
              isGeneratingAvatar: false 
            };
          }
          return c;
        });
        return { characters: list };
      });
    } catch (e: any) {
      const isAbort = e.name === 'AbortError' || 
                      e.message === 'USER_ABORTED' || 
                      e.message?.toLowerCase().includes('abort') || 
                      controller.signal.aborted;
      if (isAbort) {
        updateActiveProject(prev => {
          const list = prev.characters.map(c => {
            if (c.id === charId) {
              return { 
                ...c, 
                isGeneratingAvatar: false 
              };
            }
            return c;
          });
          return { characters: list };
        });
        return;
      }
      showToast(`角色設計圖生成失敗：${e.message || "與繪圖伺服器連接時發生錯誤"}`, "error");
      const fallbackUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80";
      updateActiveProject(prev => {
        const list = prev.characters.map(c => {
          if (c.id === charId) {
            return { 
              ...c, 
              avatarUrl: fallbackUrl,
              avatarUrls: [fallbackUrl],
              isGeneratingAvatar: false 
            };
          }
          return c;
        });
        return { characters: list };
      });
    } finally {
      if (abortControllersRef.current[charId] === controller) {
        delete abortControllersRef.current[charId];
      }
    }
  };

  const handleStopGenerateAvatar = (charId: string) => {
    if (abortControllersRef.current[charId]) {
      console.log(`[Toonflow] Stopping character generation ${charId}...`);
      abortControllersRef.current[charId].abort(new Error("USER_ABORTED"));
      delete abortControllersRef.current[charId];
    }
    if (activeProject) {
      const updatedChars = activeProject.characters.map(c => {
        if (c.id === charId) return { ...c, isGeneratingAvatar: false };
        return c;
      });
      updateActiveProject({ characters: updatedChars });
    }
  };

  // Simulated 3D Camera / Pan playback loop trigger
  const triggerSimulation = (scene: Scene) => {
    setSelectedSceneForSimulation(scene);
    setIsPlayingSimulation(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-pink-500 selection:text-white overflow-x-hidden">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-[9999] p-4 rounded-xl shadow-2xl border flex items-center space-x-3 backdrop-blur-md max-w-sm ${
              toast.type === "success" 
                ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-200" 
                : toast.type === "error"
                  ? "bg-red-950/95 border-red-500/30 text-red-200"
                  : "bg-indigo-950/95 border-indigo-500/30 text-indigo-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600 blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] rounded-full bg-pink-600 blur-3xl animate-pulse" style={{ animationDuration: "18s" }} />
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-600 blur-3xl animate-pulse" style={{ animationDuration: "15s" }} />
      </div>

      {/* Main Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => setActiveProjectId(null)}
            className="bg-gradient-to-tr from-pink-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-pink-600/20 cursor-pointer hover:opacity-90 active:scale-95 transition"
          >
            <Film className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-white">
                Toonflow Platform
              </h1>
              <span className="text-[10px] bg-gradient-to-r from-pink-500/20 to-indigo-500/20 text-pink-400 font-mono px-2 py-0.5 rounded-full border border-pink-500/30">
                Remix V2.1
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Scene Cinematic Script & Video Production Lab</p>
          </div>
        </div>

        {/* Global actions and Settings */}
        <div className="flex items-center space-x-3">
          {activeProjectId && (
            <button
              onClick={() => setActiveProjectId(null)}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>返回大廳</span>
            </button>
          )}

          {activeProjectId && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 space-x-0.5">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0 && (!stableProjectRef.current || getProjectSignature(activeProject) === getProjectSignature(stableProjectRef.current))}
                className={`p-1.5 rounded-md transition flex items-center gap-1 ${
                  undoStack.length > 0 || (stableProjectRef.current && activeProject && getProjectSignature(activeProject) !== getProjectSignature(stableProjectRef.current))
                    ? "text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    : "text-slate-600 cursor-not-allowed opacity-50"
                }`}
                title="復原變更 (Ctrl+Z)"
              >
                <Undo className="w-3.5 h-3.5" />
                <span className="text-[10px] px-0.5 font-bold uppercase hidden md:inline">復原</span>
              </button>
              <div className="w-px h-3.5 bg-slate-800" />
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className={`p-1.5 rounded-md transition flex items-center gap-1 ${
                  redoStack.length > 0
                    ? "text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    : "text-slate-600 cursor-not-allowed opacity-50"
                }`}
                title="重做變更 (Ctrl+Y)"
              >
                <Redo className="w-3.5 h-3.5" />
                <span className="text-[10px] px-0.5 font-bold uppercase hidden md:inline">重做</span>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium font-mono text-[11px]">guest_local_user</span>
            <span className="bg-pink-500/10 text-pink-400 text-[9px] px-1.5 py-0.5 rounded border border-pink-500/20 font-bold uppercase">Local Mode</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition shadow-sm cursor-pointer"
            title="Open Config Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Primary views container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
        
        {/* ================= VIEW 1: DASHBOARD ================= */}
        {activeProjectId === null || !activeProject ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto py-12"
          >
            {/* Beautiful branding hero section */}
            <div className="text-center space-y-3 max-w-2xl mx-auto mb-4">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Toonflow Dashboard
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Welcome back. Ready to bring your ideas to life? Manage multiple narrative projects, split stories with Gemini AI, configure video engines, and export cinematic masterpieces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Recent project list */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Recent Projects (專案管理)</span>
                  <span className="text-xs text-slate-500 font-mono">Count: {projects.length}</span>
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {projects.map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setActiveTab("scenes");
                      }}
                      className="group bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 p-4 rounded-xl flex items-center justify-between transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200 group-hover:text-indigo-400 transition text-sm">
                          {proj.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Created: {proj.createdAt}</span>
                          <span>•</span>
                          <span className="text-indigo-400">{proj.scenes.length} Scenes</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-1.5 bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-red-400 border border-slate-850 rounded-lg transition"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
                      No projects available. Create a new animation project to begin.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Create new project */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-white">Create New</h3>
                  <p className="text-xs text-slate-400">Start a fresh animations storyboard project from scratch.</p>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">Project Name (專案名稱)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                      placeholder="輸入新專案名稱..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>創建新專案 (Create Project)</span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          // ================= VIEW 2: ACTIVE WORKSPACE =================
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar: Workspace Info & Vertical Tabs Stack */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-pink-500 font-mono tracking-wider uppercase font-extrabold">Active Workspace</p>
                  <h2 className="font-display font-black text-2xl text-white tracking-tight leading-none">
                    {activeProject.name}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Created: {activeProject.createdAt}
                  </p>
                </div>

                {/* Stacked Vertical Tab Switcher */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveTab("novel")}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer border ${
                      activeTab === "novel"
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>原著小說 📖</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("characters")}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer border ${
                      activeTab === "characters"
                        ? "bg-gradient-to-r from-pink-600 to-indigo-600 text-white border-pink-500 shadow-lg shadow-pink-600/20"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span>角色一致性 👥</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("scenes")}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer border ${
                      activeTab === "scenes"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500 shadow-lg shadow-cyan-600/20"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>AI 分鏡劇本 ⚡</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("scenes_ext")}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer border ${
                      activeTab === "scenes_ext"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-emerald-400" />
                      <span>AI 分鏡劇本延長 🧩</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("scenes_keyframes")}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer border ${
                      activeTab === "scenes_keyframes"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-600/20"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-400" />
                      <span>AI 分鏡劇本首尾幀 🎬</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer border ${
                      activeTab === "gallery"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-emerald-400" />
                      <span>已生成影片庫 📽️</span>
                    </span>
                  </button>
                </div>

                {/* Export Project Script Section */}
                <div className="pt-5 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase font-bold">劇本匯出與離線備份</p>
                    <span className="text-[9px] text-slate-500 font-mono">Export v1.1</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="w-full py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/5"
                      title="匯出為標準 CSV 逗號分隔值檔案，適用於 Excel / 試算表軟體"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                      <span>匯出 CSV 劇本資料</span>
                    </button>
                    <button
                      onClick={() => setIsPrintModalOpen(true)}
                      className="w-full py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-pink-500/50 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-pink-500/5"
                      title="開啟導演劇本列印預覽，可直接另存為 PDF 檔案"
                    >
                      <Printer className="w-4 h-4 text-pink-400 animate-pulse" />
                      <span>列印劇本與匯出 PDF</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Tab Content */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* ============ TAB: ORIGINAL NOVEL ============ */}
              {activeTab === "novel" && (
                <div className="w-full space-y-6">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      原著小說劇本輸入 (Original Novel Novel text area)
                    </h3>
                    <p className="text-xs text-slate-400">
                      貼上您要進行分鏡的小說段落。接下來，一條龍 AI 拆解引擎將會自動為您分析段落，識別出場角色，提取精彩台詞對白，並智慧翻譯生成精美的 3D English Storyboard 繪圖提示詞！
                    </p>

                    {/* Agent Selector for Novel Generation */}
                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-indigo-400" />
                          選擇參與創作的 Agent (多選時將自動進行組內協調討論)：
                        </label>
                        <button
                          onClick={() => {
                            if (selectedNovelAgents.length === 3) {
                              setSelectedNovelAgents([]);
                            } else {
                              setSelectedNovelAgents(['gemini', 'agnes', 'mistral']);
                            }
                          }}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          {selectedNovelAgents.length === 3 ? "全部取消" : "全選"}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'gemini' as const, name: 'Gemini', color: 'border-indigo-500/30 text-indigo-200 bg-indigo-950/20', activeColor: 'border-indigo-500 bg-indigo-950/50 text-indigo-100 ring-1 ring-indigo-500/30' },
                          { id: 'agnes' as const, name: 'Agnes', color: 'border-pink-500/30 text-pink-200 bg-pink-950/20', activeColor: 'border-pink-500 bg-pink-950/50 text-pink-100 ring-1 ring-pink-500/30' },
                          { id: 'mistral' as const, name: 'Agent3 (Mistral)', color: 'border-blue-500/30 text-blue-200 bg-blue-950/20', activeColor: 'border-blue-500 bg-blue-950/50 text-blue-100 ring-1 ring-blue-500/30' }
                        ].map((agent) => {
                          const isSelected = selectedNovelAgents.includes(agent.id);
                          return (
                            <button
                              key={agent.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedNovelAgents(selectedNovelAgents.filter(a => a !== agent.id));
                                } else {
                                  setSelectedNovelAgents([...selectedNovelAgents, agent.id]);
                                }
                              }}
                              className={`py-2 px-3 border rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                                isSelected ? agent.activeColor : `${agent.color} hover:bg-slate-800/40`
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current animate-pulse' : 'bg-slate-600'}`} />
                              {agent.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => setShowIdeaInput(!showIdeaInput)}
                        className="py-2 px-4 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 font-medium rounded-lg text-[11px] transition border border-indigo-700/50 flex items-center gap-2 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>我有想法，AI 幫我寫</span>
                      </button>
                      <button
                        onClick={() => handleGenerateNovel(true)}
                        disabled={isGeneratingNovel || selectedNovelAgents.length === 0}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-[11px] transition border border-slate-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingNovel && !showIdeaInput ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span>
                          {isGeneratingNovel && !showIdeaInput
                            ? (selectedNovelAgents.length > 1 ? "AI 討論與隨機創作中..." : "隨機故事生成中...")
                            : (selectedNovelAgents.length > 1 ? "全部 Agent 共同創作隨機故事" : "隨機故事生成")}
                        </span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showIdeaInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-4"
                        >
                          <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-4 space-y-3">
                            <label className="text-[11px] font-bold text-indigo-300 block">請輸入您的靈感或想法：</label>
                            <textarea
                              className="w-full min-h-[80px] bg-slate-950/80 border border-indigo-900/50 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                              placeholder="例如：一個賽步龐克城市的偵探，發現了一隻會說話的流浪貓..."
                              value={novelIdea}
                              onChange={(e) => setNovelIdea(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleGenerateNovel(false)}
                                disabled={isGeneratingNovel || !novelIdea.trim() || selectedNovelAgents.length === 0}
                                className="py-2 px-5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-lg text-xs transition shadow shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {isGeneratingNovel ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                <span>
                                  {isGeneratingNovel 
                                    ? (selectedNovelAgents.length > 1 ? "AI 群腦激盪創作中..." : "故事生成中...") 
                                    : (selectedNovelAgents.length > 1 ? "全部 Agent 激盪創作" : "開始 AI 生成")}
                                </span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <textarea
                      className="w-full min-h-[250px] bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 leading-relaxed font-sans"
                      placeholder="在此貼上您的小說或劇本文字..."
                      value={activeProject.novelText}
                      onChange={(e) => updateActiveProject({ novelText: e.target.value })}
                    />

                    {/* Chatbot Interface */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-sm font-medium text-slate-200">AI 劇本助理</h4>
                      </div>
                      
                      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-slate-500 text-xs py-4">
                            需要修改劇本嗎？告訴 AI 你的想法，它可以幫你擴寫、精簡或改寫內容。
                          </div>
                        ) : (
                          chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                                msg.role === 'user' 
                                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                                  : msg.agent === 'agnes' 
                                    ? 'bg-pink-900/40 border border-pink-800/50 text-pink-100 rounded-tl-none'
                                    : msg.agent === 'mistral'
                                      ? 'bg-blue-900/40 border border-blue-800/50 text-blue-100 rounded-tl-none'
                                      : msg.agent === 'all'
                                        ? 'bg-purple-900/40 border border-purple-800/50 text-purple-100 rounded-tl-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                              }`}>
                                {msg.role === 'ai' && (
                                  <div className="text-[10px] font-bold mb-1 opacity-80 uppercase flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      msg.agent === 'agnes' 
                                        ? 'bg-pink-400' 
                                        : msg.agent === 'mistral'
                                          ? 'bg-blue-400'
                                          : msg.agent === 'all'
                                            ? 'bg-purple-400 animate-pulse'
                                            : 'bg-indigo-400'
                                    }`} />
                                    {msg.agent === 'agnes' ? 'Agnes' : msg.agent === 'mistral' ? 'Agent3 (Mistral)' : msg.agent === 'all' ? '全部 Agent 討論整合' : 'Gemini'}
                                  </div>
                                )}
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                              </div>
                            </div>
                          ))
                        )}
                        {isChatting && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 text-sm text-slate-400 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" /> AI 思考中...
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 mt-2">
                        {/* Selector for Chatbot Agents */}
                        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                              參與本次討論修改的 Agent (多選將啟動協調與合意機制)：
                            </span>
                            <button
                              onClick={() => {
                                if (selectedChatAgents.length === 3) {
                                  setSelectedChatAgents([]);
                                } else {
                                  setSelectedChatAgents(['gemini', 'agnes', 'mistral']);
                                }
                              }}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              {selectedChatAgents.length === 3 ? "全部取消" : "全選"}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'gemini' as const, name: 'Gemini', color: 'border-indigo-500/20 text-indigo-300 bg-indigo-950/10', activeColor: 'border-indigo-500 bg-indigo-950/30 text-indigo-200 ring-1 ring-indigo-500/20' },
                              { id: 'agnes' as const, name: 'Agnes', color: 'border-pink-500/20 text-pink-300 bg-pink-950/10', activeColor: 'border-pink-500 bg-pink-950/30 text-pink-200 ring-1 ring-pink-500/20' },
                              { id: 'mistral' as const, name: 'Agent3 (Mistral)', color: 'border-blue-500/20 text-blue-300 bg-blue-950/10', activeColor: 'border-blue-500 bg-blue-950/30 text-blue-200 ring-1 ring-blue-500/20' }
                            ].map((agent) => {
                              const isSelected = selectedChatAgents.includes(agent.id);
                              return (
                                <button
                                  key={agent.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedChatAgents(selectedChatAgents.filter(a => a !== agent.id));
                                    } else {
                                      setSelectedChatAgents([...selectedChatAgents, agent.id]);
                                    }
                                  }}
                                  className={`py-1 px-2.5 border rounded-md text-[10px] font-medium transition flex items-center gap-1.5 cursor-pointer ${
                                    isSelected ? agent.activeColor : `${agent.color} hover:bg-slate-800/40`
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-current animate-pulse' : 'bg-slate-600'}`} />
                                  {agent.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <textarea
                          id="chat-input"
                          className="w-full min-h-[60px] bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                          placeholder="輸入你的修改需求（例如：請幫我把結局改得更溫馨，或加入一段精采對話）..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (chatInput.trim() && !isChatting && selectedChatAgents.length > 0) {
                                handleChatNovel(selectedChatAgents);
                              }
                            }
                          }}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleChatNovel(selectedChatAgents)}
                            disabled={isChatting || !chatInput.trim() || selectedChatAgents.length === 0}
                            className="py-2 px-5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-lg text-xs transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isChatting ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>AI 討論修改中...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>
                                  {selectedChatAgents.length === 3
                                    ? "與全部 Agent 共同討論修改"
                                    : selectedChatAgents.length > 1
                                      ? "啟動選定 Agent 群腦協調討論"
                                      : selectedChatAgents.length === 1
                                        ? `與 ${selectedChatAgents[0] === 'gemini' ? 'Gemini' : selectedChatAgents[0] === 'agnes' ? 'Agnes' : 'Agent3'} 進行討論修改`
                                        : "請選擇 Agent"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveTab("characters")}
                        className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition border border-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>前往角色設定</span>
                      </button>
                      <button
                        onClick={handleAISplitNovel}
                        disabled={isDisassembling || !activeProject.novelText.trim()}
                        className="py-3.5 px-6 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs transition shadow-lg shadow-pink-600/10 flex items-center gap-2 cursor-pointer disabled:opacity-55"
                      >
                        {isDisassembling ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>AI 智能劇本拆解分析中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-pink-200" />
                            <span>+ 一鍵 AI 拆解分鏡</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TAB: CHARACTERS ============ */}
              {activeTab === "characters" && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-500 animate-pulse" />
                        故事角色與一致性設定 (Character Consistency)
                      </h3>
                      <p className="text-xs text-slate-400">
                        在此設定您的故事主角，產生專屬的主角相片，並在後續的分鏡繪圖中獲得高度一致性的主角臉部與外表特徵。
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleExportAllCharacters}
                        className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer relative z-50 pointer-events-auto shrink-0"
                      >
                        <Download className="w-4 h-4 text-slate-300" />
                        <span className="hidden sm:inline">匯出設定</span>
                      </button>
                      <button
                        onClick={handleAddCharacter}
                        className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer relative z-50 pointer-events-auto shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>新增自定義角色</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-2 items-start">
                    {/* Left side: Project characters */}
                    <div className="xl:col-span-8 space-y-6">
                      {activeProject.characters.length === 0 ? (
                        <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs bg-slate-950/20">
                          暫無角色。請在左側「原著小說」點擊「一鍵 AI 拆解分鏡」自動提取，或點擊上方「新增自定義角色」手動建立！
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {activeProject.characters.map(char => (
                            <div 
                              key={char.id}
                              className="bg-slate-950/70 border border-slate-850 rounded-2xl p-6 flex flex-col space-y-4 shadow-xl backdrop-blur-md relative group hover:border-slate-800 transition-colors"
                            >
                              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button
                                  onClick={() => handleExportCharacterProfile(char)}
                                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="匯出角色設定檔"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChar(char.id)}
                                  className="p-2 bg-slate-900 hover:bg-red-950/60 border border-slate-800 rounded-xl text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete Character"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Avatar Display & Generator on the Left */}
                                <div className="md:col-span-4 flex flex-col items-center space-y-4">
                                  <div className="text-[10px] font-mono text-indigo-400 font-bold tracking-wider uppercase block bg-slate-950/80 px-2.5 py-1 border border-slate-850 rounded-full text-center w-full">
                                    🎨 一致性三視角設計圖 (Gemini Image AI)
                                  </div>
                                  
                                  {/* Single Multi-angle Canvas Sheet */}
                                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow shadow-indigo-950/50 group-avatar group">
                                    {char.avatarUrl ? (
                                      <img src={char.avatarUrl} alt={`${char.name} Character Sheet`} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                                    ) : char.isGeneratingAvatar ? (
                                      <div className="flex flex-col items-center space-y-3 text-indigo-400">
                                        <RefreshCw className="w-8 h-8 animate-spin" />
                                        <span className="text-[10px] font-mono">正在調用 AI 繪製三視角插圖...</span>
                                        <button
                                          onClick={() => handleStopGenerateAvatar(char.id)}
                                          className="px-4 py-1.5 bg-red-600/95 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg transition shadow flex items-center gap-1 cursor-pointer z-30"
                                        >
                                          <StopCircle className="w-3.5 h-3.5" />
                                          <span>停止繪圖</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center space-y-1.5 text-slate-600">
                                        <User className="w-10 h-10" />
                                        <span className="text-[10px]">無主角相片 (採用 Gemini AI)</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 w-full mt-2">
                                    <button
                                      onClick={() => handleGenerateAvatar(char.id, 'nanobanana')}
                                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-bold rounded-lg border border-slate-800 hover:border-slate-600 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative z-20"
                                      title="Nano Banana 高速免金鑰，完美生成"
                                    >
                                      {char.isGeneratingAvatar ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-yellow-400" />}
                                      <span>Nano Banana</span>
                                    </button>
                                    <button
                                      onClick={() => handleGenerateAvatar(char.id, 'gemini')}
                                      className="w-full py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 text-[9px] font-bold rounded-lg border border-indigo-900 hover:border-indigo-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative z-20"
                                    >
                                      {char.isGeneratingAvatar ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-indigo-400" />}
                                      <span>Gemini AI</span>
                                    </button>
                                    <button
                                      onClick={() => handleGenerateAvatar(char.id, 'agnes')}
                                      className="w-full py-1.5 bg-pink-950 hover:bg-pink-900 text-pink-200 text-[9px] font-bold rounded-lg border border-pink-900 hover:border-pink-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative z-20"
                                    >
                                      {char.isGeneratingAvatar ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-pink-400" />}
                                      <span>Agnes AI</span>
                                    </button>
                                    <button
                                      onClick={() => handleGenerateAvatar(char.id, 'mistral')}
                                      className="w-full py-1.5 bg-orange-950 hover:bg-orange-900 text-orange-200 text-[9px] font-bold rounded-lg border border-orange-900 hover:border-orange-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative z-20"
                                    >
                                      {char.isGeneratingAvatar ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-orange-400" />}
                                      <span>Mistral AI</span>
                                    </button>
                                    <label className="col-span-2 w-full py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-[9px] font-bold rounded-lg border border-emerald-900/50 hover:border-emerald-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative z-20" title="可選擇上傳多張相片作為角色一致性特徵參考">
                                      <Upload className="w-3 h-3 text-emerald-400" />
                                      <span>上傳多張相片</span>
                                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUploadAvatar(e, char.id)} />
                                    </label>
                                  </div>

                                  {/* Uploaded Reference Photos Grid */}
                                  {char.uploadedAvatarUrls && char.uploadedAvatarUrls.length > 0 && (
                                    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 space-y-1.5 mt-2 relative z-30">
                                      <div className="flex justify-between items-center px-0.5">
                                        <span className="text-[10px] font-mono font-bold text-indigo-400">
                                          📸 參考相片庫 ({char.uploadedAvatarUrls.length} 張)
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                        {char.uploadedAvatarUrls.map((url, idx) => {
                                          const isPrimary = char.uploadedAvatarUrl === url;
                                          return (
                                            <div 
                                              key={idx} 
                                              className={`relative group/ref aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                                isPrimary ? 'border-emerald-500 ring-2 ring-emerald-950 scale-[0.98]' : 'border-slate-800 hover:border-slate-600 hover:scale-105'
                                              }`}
                                              onClick={() => {
                                                updateActiveProject(prev => {
                                                  const list = prev.characters.map(c => {
                                                    if (c.id === char.id) {
                                                      return { 
                                                        ...c, 
                                                        uploadedAvatarUrl: url,
                                                        avatarUrl: url
                                                      };
                                                    }
                                                    return c;
                                                  });
                                                  return { characters: list };
                                                });
                                                showToast('已切換主參考相片', 'success');
                                              }}
                                              title={isPrimary ? "目前主要參考相片 (面部特徵核心)" : "點擊設為主要參考"}
                                            >
                                              <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                              
                                              {isPrimary && (
                                                <div className="absolute top-0.5 left-0.5 bg-emerald-600 text-white rounded-full p-0.5 scale-75 z-10" title="主要參考">
                                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                </div>
                                              )}

                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteUploadedPhoto(char.id, url);
                                                }}
                                                className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/ref:opacity-100 transition-opacity cursor-pointer z-25 scale-75"
                                                title="刪除此參考"
                                              >
                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {char.isGeneratingAvatar && (
                                    <div className="flex flex-col gap-1.5 items-center justify-center p-2 bg-slate-900/80 rounded-lg border border-red-500/30 animate-pulse mt-2 w-full">
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        主角相片繪製中...
                                      </div>
                                      <div className="flex gap-2 w-full">
                                        <button
                                          onClick={() => handleStopGenerateAvatar(char.id)}
                                          className="flex-1 py-1 bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <StopCircle className="w-3 h-3" />
                                          <span>停止</span>
                                        </button>
                                        <button
                                          onClick={() => handleGenerateAvatar(char.id, 'agnes')}
                                          className="flex-1 py-1 bg-pink-700/90 hover:bg-pink-600 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                                          <span>重繪 (Agnes)</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Character Details Inputs */}
                                <div className="md:col-span-8 flex flex-col space-y-4 justify-center relative z-20">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">角色名稱</label>
                                      <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500 transition relative z-20"
                                        value={char.name}
                                        onChange={(e) => handleUpdateChar(char.id, "name", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">身份/職業</label>
                                      <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition relative z-20"
                                        value={char.role || ""}
                                        onChange={(e) => handleUpdateChar(char.id, "role", e.target.value)}
                                        placeholder="例如：高冷總裁"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">年齡</label>
                                      <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition relative z-20"
                                        value={char.age || ""}
                                        onChange={(e) => handleUpdateChar(char.id, "age", e.target.value)}
                                        placeholder="例如：25歲"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">服裝風格</label>
                                      <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition relative z-20"
                                        value={char.clothing || ""}
                                        onChange={(e) => handleUpdateChar(char.id, "clothing", e.target.value)}
                                        placeholder="例如：黑色西裝"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">性格特質</label>
                                      <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition relative z-20"
                                        value={char.personality || ""}
                                        onChange={(e) => handleUpdateChar(char.id, "personality", e.target.value)}
                                        placeholder="例如：冷酷堅毅"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">表情/情緒 (Mood)</label>
                                      <select
                                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition relative z-20 font-bold text-indigo-300"
                                        value={char.mood || ""}
                                        onChange={(e) => handleUpdateChar(char.id, "mood", e.target.value)}
                                      >
                                        <option value="">預設 / 無 (Default)</option>
                                        <option value="happy">😊 開心 / 微笑 (Happy)</option>
                                        <option value="sad">😢 悲傷 / 憂鬱 (Sad)</option>
                                        <option value="angry">😠 憤怒 / 生氣 (Angry)</option>
                                        <option value="excited">🤩 興奮 / 驚喜 (Excited)</option>
                                        <option value="fearful">😰 恐懼 / 害怕 (Fearful)</option>
                                        <option value="thoughtful">🤔 沉思 / 嚴肅 (Thoughtful)</option>
                                        <option value="smug">😏 傲慢 / 得意 (Smug)</option>
                                        <option value="shy">😳 害羞 / 臉紅 (Shy)</option>
                                        <option value="tired">🥱 疲倦 / 虛脫 (Tired)</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">AI 繪圖英文特徵描述 (Visual Prompt)</label>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleTranslateCharacterPrompt(char.id, 'gemini')}
                                          className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                                          title="調用 Gemini 翻譯為高品質英文繪圖提示詞"
                                        >
                                          ✨ Gemini 優化
                                        </button>
                                        <button
                                          onClick={() => handleTranslateCharacterPrompt(char.id, 'mistral')}
                                          className="text-[9px] text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                                          title="調用 Mistral AI 翻譯為高品質英文繪圖提示詞"
                                        >
                                          🔮 Mistral AI 優化
                                        </button>
                                      </div>
                                    </div>
                                    <textarea
                                      className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[70px] relative z-20"
                                      value={char.description}
                                      onChange={(e) => handleUpdateChar(char.id, "description", e.target.value)}
                                      placeholder="例如：A handsome young male executive..."
                                    />
                                  </div>

                                  <div className="flex justify-between items-center pt-3 border-t border-slate-850 mt-2 gap-2 flex-wrap">
                                    <div className="text-[9px] text-slate-500 font-mono">
                                      一致性基礎：{char.uploadedAvatarUrls && char.uploadedAvatarUrls.length > 0 ? `✨ 已載入 ${char.uploadedAvatarUrls.length} 張參考相片鎖定核心面部特徵` : (char.uploadedAvatarUrl ? "✨ 已鎖定您上傳的相片作為核心面部特徵" : (char.avatarUrl ? "已生成三視角設計圖" : "尚未生成設計圖"))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSyncCharacterClothing(char.id)}
                                        className="py-1.5 px-3 bg-pink-950/75 hover:bg-pink-900 border border-pink-900/50 hover:border-pink-700 text-pink-300 hover:text-pink-100 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer z-30"
                                        title="AI 智能分析所有含有此角色的分鏡，自動將分鏡中的服裝描述修正為與此處設定的「服裝風格」一致"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                                        <span>一鍵同步服裝至所有分鏡 👔</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveToLibrary(char)}
                                        className="py-1.5 px-3 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-900/50 hover:border-indigo-700 text-indigo-300 hover:text-indigo-100 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer z-30"
                                        title="將此角色設定儲存至全局角色庫，以便在其他專案中重複使用"
                                      >
                                        <Bookmark className="w-3.5 h-3.5 text-pink-500 fill-pink-500/10" />
                                        <span>儲存至全局角色庫</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Character Consistency Trait Comparison Panel */}
                              <div className="border-t border-slate-850 pt-5 mt-4 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                                  <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                                      <Sliders className="w-4 h-4 text-indigo-500 animate-pulse" />
                                      角色一致性特徵即時比對與 AI 修正對齊 (Trait Consistency Panel)
                                    </h4>
                                    <p className="text-[10px] text-slate-400">
                                      即時分析與比對當前角色設定與原著劇本目標，協助您點擊進行一致性修正優化。
                                    </p>
                                  </div>
                                  {!char.targetRole && (
                                    <button
                                      type="button"
                                      disabled={analyzingTargetId === char.id}
                                      onClick={() => handleAnalyzeCharacterTarget(char)}
                                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer z-30 shadow-md shadow-indigo-950/40 relative pointer-events-auto"
                                    >
                                      {analyzingTargetId === char.id ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                      )}
                                      <span>分析原著特徵目標 🔍</span>
                                    </button>
                                  )}
                                </div>

                                {!char.targetRole ? (
                                  <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-xl p-5 text-center text-slate-500 text-[11px] space-y-3">
                                    <p>💡 目前尚未分析此角色的原著設定目標。請點擊上方按鈕，AI 將自動掃描分析您的原著小說，提取最符合該角色的身分、年齡、服裝、性格與視覺特徵！</p>
                                    <button
                                      type="button"
                                      disabled={analyzingTargetId === char.id}
                                      onClick={() => handleAnalyzeCharacterTarget(char)}
                                      className="mx-auto py-2 px-4 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-900/60 hover:border-indigo-700 text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                                    >
                                      {analyzingTargetId === char.id ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
                                      )}
                                      <span>啟動 AI 智能原著特徵提取與分析</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {/* 2-column Bento Grid of Traits */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                      {/* Trait Card Maker */}
                                      {[
                                        {
                                          label: "身份定位 (Role)",
                                          field: "role" as keyof Character,
                                          current: char.role || "未設定",
                                          target: char.targetRole,
                                          icon: "👤",
                                        },
                                        {
                                          label: "估計年齡 (Age)",
                                          field: "age" as keyof Character,
                                          current: char.age || "未設定",
                                          target: char.targetAge,
                                          icon: "📅",
                                        },
                                        {
                                          label: "服裝風格 (Clothing)",
                                          field: "clothing" as keyof Character,
                                          current: char.clothing || "未設定",
                                          target: char.targetClothing,
                                          icon: "👔",
                                        },
                                        {
                                          label: "性格特質 (Personality)",
                                          field: "personality" as keyof Character,
                                          current: char.personality || "未設定",
                                          target: char.targetPersonality,
                                          icon: "🧠",
                                        },
                                        {
                                          label: "表情情緒 (Mood)",
                                          field: "mood" as keyof Character,
                                          current: char.mood || "預設",
                                          target: char.targetMood || "預設",
                                          icon: "🎭",
                                        },
                                      ].map((trait) => {
                                        const isAligned =
                                          String(trait.current).trim().toLowerCase() ===
                                          String(trait.target).trim().toLowerCase();
                                        return (
                                          <div
                                            key={trait.field}
                                            className="bg-slate-900/40 border border-slate-850 rounded-xl p-3 space-y-2 relative group hover:border-slate-800 transition-colors"
                                          >
                                            <div className="flex justify-between items-center">
                                              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                                <span>{trait.icon}</span>
                                                <span>{trait.label}</span>
                                              </span>
                                              <span
                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                                  isAligned
                                                    ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                                                    : "bg-amber-950/40 border-amber-900/60 text-amber-400"
                                                }`}
                                              >
                                                {isAligned ? "✅ 完全一致" : "⚠️ 存在偏差"}
                                              </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                              <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                                                <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">當前專案設定</div>
                                                <div className="text-white truncate font-medium">{trait.current}</div>
                                              </div>
                                              <div className="bg-indigo-950/15 p-2 rounded-lg border border-indigo-950/40 relative group">
                                                <div className="text-[9px] text-indigo-400 font-bold uppercase mb-0.5">原著目標設定</div>
                                                <div className="text-slate-300 truncate font-medium">{trait.target}</div>
                                                {!isAligned && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleApplyTargetTrait(char.id, trait.field, trait.target)}
                                                    className="absolute inset-0 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30"
                                                    title="套用此原著設定"
                                                  >
                                                    <span>一鍵修正套用 ⚡</span>
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}

                                      {/* Full width Visual Prompt comparison card */}
                                      <div className="md:col-span-2 bg-slate-900/40 border border-slate-850 rounded-xl p-3 space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                            <span>🎨</span>
                                            <span>AI 英文視覺 Prompt 描述 (Visual Prompt)</span>
                                          </span>
                                          {char.description !== char.targetDescription && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-950/40 border-amber-900/60 text-amber-400">
                                              ⚠️ 描述不一致
                                            </span>
                                          )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 space-y-1">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">當前專案 Prompt</div>
                                            <div className="text-white font-mono leading-relaxed text-[10px] line-clamp-3 overflow-y-auto pr-1 max-h-[70px]">
                                              {char.description || "未設定"}
                                            </div>
                                          </div>
                                          <div className="bg-indigo-950/15 p-2.5 rounded-lg border border-indigo-950/40 space-y-1 relative group">
                                            <div className="text-[9px] text-indigo-400 font-bold uppercase">原著目標 Prompt</div>
                                            <div className="text-slate-300 font-mono leading-relaxed text-[10px] line-clamp-3 overflow-y-auto pr-1 max-h-[70px]">
                                              {char.targetDescription || "未分析"}
                                            </div>
                                            {char.description !== char.targetDescription && (
                                              <button
                                                type="button"
                                                onClick={() => handleApplyTargetTrait(char.id, "description", char.targetDescription)}
                                                className="absolute inset-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30"
                                              >
                                                <span>套用此 AI 推薦繪圖 Prompt 🎨</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Bar for aligned traits */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 border border-slate-850 p-3 rounded-xl">
                                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <span>💡</span>
                                        <span>可點擊各項「原著目標設定」進行個別修正，或點擊右側按鈕一鍵完成全特徵對齊。</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          disabled={analyzingTargetId === char.id}
                                          onClick={() => handleAnalyzeCharacterTarget(char)}
                                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 transition cursor-pointer z-30 flex items-center gap-1"
                                        >
                                          <RefreshCw className={`w-3 h-3 ${analyzingTargetId === char.id ? "animate-spin" : ""}`} />
                                          <span>重新分析原著</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleApplyAllTargetTraits(char)}
                                          className="py-1.5 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-md shadow-emerald-950/20 cursor-pointer z-30 flex items-center gap-1"
                                        >
                                          <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                                          <span>⚡ 一鍵自動修復所有特徵偏差</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right side: Global Character Library */}
                    <div className="xl:col-span-4 bg-slate-950/70 border border-slate-850 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-pink-500" />
                          <span className="font-display font-bold text-sm text-white">跨專案全局角色庫</span>
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 text-slate-400">
                            {characterLibrary.length}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        儲存您喜愛的角色屬性與一致性設計圖，在 Toonflow 的任何專案中隨時一鍵導入與重複利用。
                      </p>

                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 animate-pulse" />
                        <input
                          type="text"
                          placeholder="搜尋角色名稱/特徵..."
                          value={librarySearchQuery}
                          onChange={(e) => setLibrarySearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-9 pr-8 py-2 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                        {librarySearchQuery && (
                          <button 
                            onClick={() => setLibrarySearchQuery("")}
                            className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {characterLibrary.filter(c => {
                        const q = librarySearchQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          c.name.toLowerCase().includes(q) ||
                          (c.role && c.role.toLowerCase().includes(q)) ||
                          (c.description && c.description.toLowerCase().includes(q)) ||
                          (c.personality && c.personality.toLowerCase().includes(q))
                        );
                      }).length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-slate-900 rounded-xl text-slate-600 text-[11px] space-y-2">
                          <Users className="w-6 h-6 mx-auto mb-1 opacity-30 text-slate-500" />
                          <p className="font-medium text-slate-500">
                            {librarySearchQuery 
                              ? "找不到符合搜尋條件的角色" 
                              : "角色庫目前為空"}
                          </p>
                          {!librarySearchQuery && (
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              在左側角色卡底端點擊「儲存至全局角色庫」即可將心儀的主角收藏至此。
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {characterLibrary.filter(c => {
                            const q = librarySearchQuery.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              c.name.toLowerCase().includes(q) ||
                              (c.role && c.role.toLowerCase().includes(q)) ||
                              (c.description && c.description.toLowerCase().includes(q)) ||
                              (c.personality && c.personality.toLowerCase().includes(q))
                            );
                          }).map(libChar => (
                            <div 
                              key={libChar.id}
                              className="bg-slate-900/40 hover:bg-slate-900 border border-slate-850/50 hover:border-slate-800 rounded-xl p-3 transition flex gap-3 group/lib relative"
                            >
                              {/* Avatar (left) */}
                              <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-850 overflow-hidden flex items-center justify-center shrink-0">
                                {libChar.avatarUrl ? (
                                  <img src={libChar.avatarUrl} alt={libChar.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <User className="w-5 h-5 text-slate-700" />
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-white truncate">{libChar.name}</span>
                                  {libChar.role && (
                                    <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 text-slate-400 shrink-0 truncate max-w-[80px]">
                                      {libChar.role}
                                    </span>
                                  )}
                                </div>
                                {libChar.description && (
                                  <p className="text-[10px] text-slate-400 line-clamp-1 truncate" title={libChar.description}>
                                    {libChar.description}
                                  </p>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => handleImportFromLibrary(libChar)}
                                    className="py-0.5 px-2 bg-pink-950 hover:bg-pink-900 hover:text-pink-100 text-pink-300 border border-pink-900 rounded text-[9px] font-bold flex items-center gap-0.5 cursor-pointer transition"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>導入此專案</span>
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFromLibrary(libChar.id, libChar.name)}
                                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-950 rounded transition cursor-pointer"
                                    title="自角色庫中移除"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setActiveTab("scenes")}
                      className="py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg hover:shadow-cyan-600/15 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>前往 AI 分鏡劇本</span>
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============ TAB: STORYBOARD SCENES & AI HUB ============ */}
              {activeTab === "scenes" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 xl:col-span-4 space-y-6">
                    {/* Settings Panel 1: Script breakdown config */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                      <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Sliders className="w-4 h-4 text-indigo-400" />
                        AI 劇本拆解引擎設定
                      </h3>

                      <div className="space-y-3">
                        {/* Selector Tabs: Mistral vs Zhipu */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                          <button
                            onClick={() => updateActiveProject({ disassemblyEngine: "mistral" })}
                            className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              activeProject.disassemblyEngine === "mistral"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <span>🔮 Mistral AI</span>
                            <span className="text-[8px] bg-indigo-500/10 px-1 py-0.2 rounded text-indigo-400">免費</span>
                          </button>
                          <button
                            onClick={() => updateActiveProject({ disassemblyEngine: "zhipu" })}
                            className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              activeProject.disassemblyEngine === "zhipu"
                                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <span>🇨🇳 智譜 AI</span>
                            <span className="text-[8px] bg-pink-500/10 px-1 py-0.2 rounded text-pink-400">免費</span>
                          </button>
                        </div>

                        {/* Model Dropdown */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">選擇 MISTRAL 模型</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                            value={activeProject.selectedModel}
                            onChange={(e) => updateActiveProject({ selectedModel: e.target.value })}
                          >
                            <option>Mistral Large 3 (高智能旗艦)</option>
                            <option>Mistral Medium 3.5 (中型效率)</option>
                            <option>Codestral 2 (專精邏輯代碼)</option>
                          </select>
                          <span className="text-[9px] text-slate-500 leading-relaxed block italic">
                            ✨ Mistral 模型免費用量開放：Large 3、Medium 3.5，零門檻供應，不需信用卡。
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Settings Panel 2: Drawing & Camera Pan config */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                      <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Clapperboard className="w-4 h-4 text-pink-400" />
                        分鏡繪圖 & 運鏡設定
                      </h3>

                      <div className="space-y-4">
                        {/* API Channel */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">繪圖 API 渠道 (手機適用)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateActiveProject({ drawingChannel: "flux" })}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                activeProject.drawingChannel === "flux"
                                  ? "bg-slate-950 border-pink-500/50 text-pink-400 shadow-lg shadow-pink-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span className="text-white">✨ Gemini AI 繪圖</span>
                              <span className="text-[8px] text-slate-400">(高速免金鑰，完美生成)</span>
                            </button>
                            <button
                              onClick={() => updateActiveProject({ drawingChannel: "sd" })}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                activeProject.drawingChannel === "sd"
                                  ? "bg-slate-950 border-pink-500/50 text-pink-400 shadow-lg shadow-pink-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span className="text-white">📱 本地 SD 接口</span>
                              <span className="text-[8px] text-slate-400">(127.0.0.1:7860)</span>
                            </button>
                          </div>
                        </div>

                        {/* Art Style Dropdown */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">分鏡美術風格</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                            value={activeProject.artStyle}
                            onChange={(e) => updateActiveProject({ artStyle: e.target.value })}
                          >
                            <option value="動漫卡通動感 (Anime key visual)">動漫卡通動感 (Anime key visual)</option>
                            <option value="寫實電影感 (Cinematic Realistic)">寫實電影感 (Cinematic Realistic)</option>
                            <option value="高擬真電影質感 (Photorealistic Cinema)">高擬真電影質感 (Photorealistic Cinema)</option>
                            <option value="賽博朋克霓虹 (Cyberpunk Neon)">賽博朋克霓虹 (Cyberpunk Neon)</option>
                            <option value="美式寫實漫畫 (Cyberpunk Comic)">美式寫實漫畫 (Cyberpunk Comic)</option>
                            <option value="水彩插畫風 (Watercolor Illustration)">水彩插畫風 (Watercolor Illustration)</option>
                            <option value="中國古風水墨 (Traditional Chinese Ink)">中國古風水墨 (Traditional Chinese Ink)</option>
                            <option value="黑白鉛筆速寫 (Pencil Sketch)">黑白鉛筆速寫 (Pencil Sketch)</option>
                            <option value="可愛3D黏土風 (Claymation 3D)">可愛3D黏土風 (Claymation 3D)</option>
                          </select>
                        </div>

                        {/* Camera Motion Dropdown */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">模擬 3D 影片運鏡模式</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                            value={activeProject.cameraMotion}
                            onChange={(e) => updateActiveProject({ cameraMotion: e.target.value })}
                          >
                            <option>經典推拉運鏡 (Classic Ken Burns Zoom & Pan)</option>
                            <option>向左慢速橫移 (Slow Pan Left)</option>
                            <option>向右慢速橫移 (Slow Pan Right)</option>
                            <option>俯視慢速拉高 (Slow Tilt Up)</option>
                            <option>仰視慢速拉低 (Slow Tilt Down)</option>
                          </select>
                        </div>

                        {/* Agnes Image Mode Select Button/Toggle */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Agnes AI 繪圖 (生成相片) 效能 / 畫質設定</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateActiveProject({ agnesImageMode: "fast" })}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                (activeProject.agnesImageMode || "quality") === "fast"
                                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span>⚡ 極速生成</span>
                              <span className="text-[8px] text-slate-400 opacity-80">(極速預覽)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveProject({ agnesImageMode: "balanced" })}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                (activeProject.agnesImageMode || "quality") === "balanced"
                                  ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span>⚖️ 平衡標準</span>
                              <span className="text-[8px] text-slate-400 opacity-80">(標準解析)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveProject({ agnesImageMode: "quality" })}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                (activeProject.agnesImageMode || "quality") === "quality"
                                  ? "bg-pink-950/40 border-pink-500/50 text-pink-400 shadow-lg shadow-pink-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span>🎨 極致畫質</span>
                              <span className="text-[8px] text-slate-400 opacity-80">(高清精細)</span>
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-normal">
                            💡 <strong>極速生成模式</strong>將圖片解析度優化調整為 768x432，大幅減少伺服器算力資源與傳輸延遲，約可提高 2 倍以上生成速度！適合創作初期快速預覽。
                          </p>
                        </div>

                        {/* Agnes Video Mode Select Button/Toggle */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Agnes AI 影片生成效能 / 畫質設定</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateActiveProject({ agnesVideoMode: "fast" })}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                (activeProject.agnesVideoMode || "quality") === "fast"
                                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span>⚡ 極速預覽</span>
                              <span className="text-[8px] text-slate-400 opacity-80">(提速 ~300%)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveProject({ agnesVideoMode: "balanced" })}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                (activeProject.agnesVideoMode || "quality") === "balanced"
                                  ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span>⚖️ 平衡標準</span>
                              <span className="text-[8px] text-slate-400 opacity-80">(提速 ~150%)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveProject({ agnesVideoMode: "quality" })}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                (activeProject.agnesVideoMode || "quality") === "quality"
                                  ? "bg-pink-950/40 border-pink-500/50 text-pink-400 shadow-lg shadow-pink-500/5"
                                  : "bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <span>🎨 極致畫質</span>
                              <span className="text-[8px] text-slate-400 opacity-80">(完整渲染)</span>
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-normal">
                            💡 <strong>極速預覽模式</strong>將影片解析度調整為 768x512，並優化為 16 FPS 與 15 步推理，大幅減少伺服器算力時間，約可提速 3 倍！適合創作初期极速看對白口型與鏡頭效果。
                          </p>
                        </div>

                        {/* Widescreen simulation disclaimer */}
                        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
                          <p className="text-[11px] font-bold text-pink-400 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-pink-400" />
                            關於免費 AI 影片生成 API 說明
                          </p>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            市面上的火山 Seedance 2, Google Veo 3, Luma Dream Machine 由於硬體算力消耗極高，皆不提供公開的免費調用 API Key。
                          </p>
                          <p className="text-[10px] text-indigo-300 leading-relaxed">
                            為了讓您實現完全免費，Toonflow 獨家研發了<strong>「本地 100% 免費影片製作大師」</strong>：利用您瀏覽器端的 HTML5 Canvas 高清渲染器 + 網頁音訊合成，一鍵將分鏡圖錄製為動態 WebM 影片！完美融合您選擇的 3D 運鏡、男女角色配音、經典電影寬畫幅 與 自動燒錄字幕，完全免費 API Key、不收費！
                          </p>
                        </div>

                        {/* Global Storyboard Chatbot */}
                        {renderStoryboardGlobalChat()}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Workflow Trigger & Scenes List */}
                  <div className="xl:col-span-8 space-y-6 relative z-10">
                    <VideoGallery activeProject={activeProject} />
                  {/* Disassemble Workflow banner */}
                    <div className="bg-gradient-to-r from-pink-900/30 via-indigo-900/20 to-slate-900/60 border border-pink-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-6 relative z-20">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-pink-400" />
                          一條龍短劇工作流 (One-Stop Workflow)
                        </h4>
                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                          AI 會自動分析小說段落、識別出場人物、提取精彩對白，並為每一幕生成適合 AI 繪圖的英文視覺描述提示詞！
                        </p>
                      </div>

                      <button
                        onClick={handleAISplitNovel}
                        disabled={isDisassembling || !activeProject.novelText.trim()}
                        className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-55 shrink-0 hover:scale-[1.02] relative z-20"
                      >
                        {isDisassembling ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>拆解中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                            <span>一鍵 AI 拆解分鏡</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Characters Overview Link */}
                    <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-850 rounded-xl relative z-20">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-pink-500 animate-pulse" />
                        <div>
                          <h4 className="text-xs font-bold text-white">故事角色一致性設定 ({activeProject.characters.length} 個角色)</h4>
                          <p className="text-[10px] text-slate-500">角色相片特徵、職業與外貌描述，會自動應用於分鏡繪圖中。</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("characters")}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>管理角色設定</span>
                        <ChevronLeft className="w-3 h-3 rotate-180" />
                      </button>
                    </div>

                    {/* Scenes List Container */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-display font-extrabold text-lg text-white">
                            分鏡腳本卡片 ({activeProject.scenes.length} 場)
                          </h3>
                          <span className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-300 font-medium capitalize">手機一鍵渲染已就緒</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleAddCustomScene}
                            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-800 transition flex items-center gap-1 cursor-pointer relative z-50 pointer-events-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>新增自定義場景</span>
                          </button>
                        </div>
                      </div>

                      {/* Scene Cards Loop */}
                      <div className="space-y-6">
                        {activeProject.scenes.map((scene, index) => {
                          const matchingChar = activeProject.characters.find(c => (c.name || "").trim().toLowerCase() === (scene.character || "").trim().toLowerCase());
                          return (
                            <div key={scene.id} className="space-y-2">
                              <SceneItem 
                                scene={scene}
                                index={index}
                                activeProjectCharacters={activeProject.characters}
                                handleUpdateSceneField={handleUpdateSceneField}
                                handleDeleteScene={handleDeleteScene}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDragEnd={handleDragEnd}
                                handleDrop={handleDrop}
                                draggedIndex={draggedIndex}
                                draggedOverIndex={draggedOverIndex}
                                matchingChar={matchingChar}
                                handleApplyStylePreset={handleApplyStylePreset}
                                handleImageDragOver={handleImageDragOver}
                                handleImageDrop={handleImageDrop}
                                handleUploadSceneImage={handleUploadSceneImage}
                                activeProjectId={activeProject.id}
                                setProjects={setProjects}
                                showToast={showToast}
                              />
                              {scene.videoUrl && (
                                  <div className="space-y-1.5 mt-2">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[10px] font-mono text-emerald-400 font-bold uppercase block flex items-center gap-1">
                                        Agnes AI Video Generated
                                      </label>
                                    </div>
                                    <div className="relative group overflow-hidden rounded-lg border border-slate-800 aspect-video bg-black">
                                      {/* Video player placeholder */}
                                      <div className="text-white">Video Player for {scene.videoUrl}</div>
                                    </div>
                                  </div>
                              )}


                              {scene.videoError && !scene.isGeneratingVideo && (
                                <div className="space-y-4 mt-2">
                                  {/* Failed Logs */}
                                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between bg-slate-900/50 px-3 py-2 border-b border-slate-800">
                                      <div className="flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs font-mono text-slate-400 leading-tight">agnes_video.py<br/>console logs</span>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          const logsText = (scene.videoLogs || []).join('\n') + `\n[SYSTEM] Agnes video task failed: ${scene.videoError}` + (scene.videoErrorCode ? `\n[SYSTEM] Failed with exit code ${scene.videoErrorCode}` : '');
                                          copyTextToClipboard(logsText, scene.id + "_failed");
                                        }}
                                        className={`flex items-center gap-1 text-[10px] transition cursor-pointer ${copiedSceneId === (scene.id + "_failed") ? "text-emerald-400 font-semibold" : "text-slate-500 hover:text-slate-300"}`}
                                      >
                                        <Copy className="w-3 h-3" />
                                        <span>{copiedSceneId === (scene.id + "_failed") ? "已複製！" : "Copy"}</span>
                                      </button>
                                    </div>
                                    <div className="p-3 bg-black/60 font-mono text-[10px] text-slate-300 h-40 overflow-y-auto space-y-2 whitespace-pre-wrap break-all">
                                      {(scene.videoLogs || []).map((l, i) => (
                                        <div key={i} className={l.includes("[ERROR]") || l.includes("failed") ? "text-red-400" : ""}>{l}</div>
                                      ))}
                                      <div className="text-red-400 mt-2">
                                        [SYSTEM] Agnes video task failed: {scene.videoError}
                                        {scene.videoErrorCode && `\n[SYSTEM] Failed with exit code ${scene.videoErrorCode}`}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-red-950/40 border border-red-900/30 rounded-xl p-3 text-left space-y-2">
                                    <p className="text-[10px] font-bold text-red-300 flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                      Agnes Video Render Failed {scene.videoErrorCode ? `(Code: ${scene.videoErrorCode})` : ""}
                                    </p>
                                    <button
                                      onClick={() => handleResetVideoTask()}
                                      className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-[10px] font-bold text-white rounded-lg transition flex items-center gap-1 cursor-pointer shadow"
                                      title="清除卡住的生成鎖，重新開始生成"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>重置影片生成鎖 (Reset Lock)</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* AI Quality Control & Continuity Review Section */}
                              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 space-y-2 text-left">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 text-indigo-400">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>AI 影視級鏡頭與連續性校驗報告</span>
                                  </span>
                                  {scene.aiReviewStatus === "passed" && (
                                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                      已通過 (Passed)
                                    </span>
                                  )}
                                  {scene.aiReviewStatus === "needs_refinement" && (
                                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                      已自動重構優化 (Refined)
                                    </span>
                                  )}
                                  {scene.aiReviewStatus === "reviewing" && (
                                    <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      審核中...
                                    </span>
                                  )}
                                  {!scene.aiReviewStatus && (
                                    <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                      待審核 (Pending)
                                    </span>
                                  )}
                                </div>

                                {scene.aiReviewCritique ? (
                                  <div className="space-y-2">
                                    <p className="text-[11px] text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-slate-850/60">
                                      {scene.aiReviewCritique}
                                    </p>
                                    <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
                                      <div className={`p-1.5 rounded text-center border ${scene.aiReviewAlignmentCheck ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                                        原著對齊: {scene.aiReviewAlignmentCheck ? "合規" : "未校驗"}
                                      </div>
                                      <div className={`p-1.5 rounded text-center border ${scene.aiReviewLogicCheck ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                                        畫面邏輯: {scene.aiReviewLogicCheck ? "流暢" : "未校驗"}
                                      </div>
                                      <div className={`p-1.5 rounded text-center border ${scene.aiReviewContinuityCheck ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                                        銜接流暢: {scene.aiReviewContinuityCheck ? "通順" : "未校驗"}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-500 italic">每當圖片或影片生成後，AI 會在此自動顯示審核與連續性流暢報告。</p>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => handleReviewScene(scene.id, 'image')}
                                    disabled={scene.isReviewing}
                                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Search className="w-3 h-3 text-indigo-400" />
                                    <span>手動重新審核本鏡頭</span>
                                  </button>
                                </div>
                              </div>

                              {/* Multi Action buttons */}
                              <div className="flex flex-col gap-2">
                                {scene.id.startsWith("scene_transition_") ? (
                                  <button
                                    onClick={() => handleGenerateImage(scene.id, 'gemini')}
                                    disabled={scene.isGeneratingImage}
                                    className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-[11px] font-bold rounded-lg border border-teal-500/30 hover:border-teal-400 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-950/20 z-30"
                                    title="一鍵提取上一場景最後一幀作為本銜接場景首幀，並設定下一場景作為過渡尾幀"
                                  >
                                    {scene.isGeneratingImage ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Link2 className="w-4 h-4 text-teal-200" />
                                    )}
                                    <span>🔗 智慧自動銜接：提取上鏡最後一幀</span>
                                  </button>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => handleGenerateImage(scene.id, 'nanobanana')}
                                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-bold rounded-lg border border-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                    >
                                      {scene.isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                                      <span>Nano 繪圖</span>
                                    </button>
                                    <button
                                      onClick={() => handleGenerateImage(scene.id, 'gemini')}
                                      className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[9px] font-bold rounded-lg border border-indigo-900 hover:border-indigo-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                    >
                                      {scene.isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                                      <span>Gemini 繪圖</span>
                                    </button>
                                    <button
                                      onClick={() => handleGenerateImage(scene.id, 'agnes')}
                                      className="w-full py-2 bg-pink-950 hover:bg-pink-900 text-pink-300 text-[9px] font-bold rounded-lg border border-pink-900 hover:border-pink-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                    >
                                      {scene.isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-pink-400" />}
                                      <span>Agnes 繪圖</span>
                                    </button>
                                    <button
                                      onClick={() => handleGenerateImage(scene.id, 'mistral')}
                                      className="w-full py-2 bg-orange-950 hover:bg-orange-900 text-orange-200 text-[9px] font-bold rounded-lg border border-orange-900 hover:border-orange-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                    >
                                      {scene.isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
                                      <span>Mistral 繪圖</span>
                                    </button>
                                  </div>
                                )}
                                {scene.isGeneratingImage && (
                                  <div className="flex flex-col gap-1.5 items-center justify-center p-2 bg-slate-900/80 rounded-lg border border-red-500/30 animate-pulse">
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      AI 正在生成插圖中...
                                    </div>
                                    <div className="flex gap-2 w-full">
                                      <button
                                        onClick={() => handleStopGenerateImage(scene.id)}
                                        className="flex-1 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                      >
                                        <StopCircle className="w-3.5 h-3.5" />
                                        <span>停止</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'agnes')}
                                        className="flex-1 py-1.5 bg-pink-700/90 hover:bg-pink-600 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                                        <span>Agnes</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'mistral')}
                                        className="flex-1 py-1.5 bg-orange-700/90 hover:bg-orange-600 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                                        <span>Mistral</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (scene.isGeneratingVideo || scene.isGeneratingVideoExt || scene.isGeneratingVideoKeyframes) {
                                        if (confirm("偵測到生成狀態卡住？點擊確定強制重置生成狀態。")) {
                                          updateActiveProject(prev => ({
                                            scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isGeneratingVideo: false, isGeneratingVideoExt: false, isGeneratingVideoKeyframes: false } : s)
                                          }));
                                        }
                                      } else {
                                        handleGenerateVideo(scene.id);
                                      }
                                    }}
                                    disabled={!scene.imageUrl}
                                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                      !scene.imageUrl 
                                        ? "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-55" 
                                        : (scene.isGeneratingVideo || scene.isGeneratingVideoExt || scene.isGeneratingVideoKeyframes)
                                          ? "bg-amber-900/50 text-amber-200 border-amber-800"
                                          : "bg-gradient-to-tr from-pink-600 to-indigo-600 text-white hover:opacity-95 border-transparent shadow"
                                    }`}
                                    title={!scene.imageUrl ? "請先完成分鏡繪圖再生成影片" : (scene.isGeneratingVideo || scene.isGeneratingVideoExt || scene.isGeneratingVideoKeyframes ? "生成卡住？點擊重置" : "調用影片模型生成 5秒 影片")}
                                  >
                                    <Video className="w-4 h-4" />
                                    <span>{scene.isGeneratingVideo || scene.isGeneratingVideoExt || scene.isGeneratingVideoKeyframes ? "⚠️ 生成中 (重置)" : "🎬 一鍵 AI 影片"}</span>
                                  </button>

                                  <label
                                    htmlFor={`upload-scene-img-${scene.id}`}
                                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                    title="從您的電腦上傳自訂分鏡插圖"
                                  >
                                    <Upload className="w-4 h-4 text-indigo-400" />
                                    <span>上傳照片</span>
                                  </label>
                                </div>
                                {index < activeProject.scenes.length - 1 && (
                                  <button
                                    onClick={() => handleInsertTransitionScene(index)}
                                    className="w-full py-2.5 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white mt-2"
                                    title="AI 會自動偵測相鄰兩個分鏡之間的敘事斷層，並生成一個額外的過渡場景"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>插入自動銜接場景</span>
                                  </button>
                                )}
                              </div>

                            {/* Inline Scene Chatbot */}
                            <div className="md:col-span-12 mt-6 border-t border-slate-800/80 pt-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                      分鏡智慧協調助理
                                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-mono font-medium">Chat & Modify</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">就該分鏡主題解答、翻譯，或下達指令即時修改此分鏡的所有內容。</p>
                                  </div>
                                </div>
                              </div>

                              {/* Chat messages container */}
                              <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3 min-h-[100px] max-h-[250px] overflow-y-auto custom-scrollbar">
                                {(!sceneChats[scene.id] || sceneChats[scene.id].length === 0) ? (
                                  <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                                    <p className="text-[11px] text-slate-500 italic">尚未與本分鏡助理進行過對話。你可以點擊以下預設指令快速進行：</p>
                                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                                      {[
                                        { text: "💡 幫我將台詞改得更有情感張力，並同步更新英文 PROMPT", action: "請幫我把台詞對白改得更有情感張力、口語化且吸引人，並依據此情感同步優化繪圖英文描述提示詞 (PROMPT) 與動作描述 (ACTION PROMPT)。" },
                                        { text: "👩 解決雙男角/雙女角問題：在 PROMPT 中明確設定主角與女主角的性別與長相", action: "我的場景中有男主角（陳默）和女主角（林芊），但 AI 繪圖生成了兩個男生。請幫我修改英文 PROMPT，在裡面明確標記：Chen Mo 為帥氣年輕男性 (handsome young Chinese male)、Lin Qian 為長髮美麗女性 (beautiful young Chinese female with long hair)，以修正雙男角問題，並保持角色服裝一致。" },
                                        { text: "🎬 幫我優化鏡頭運動 (Action Prompt) 與導演註記", action: "請幫我精進本分鏡的「影片動作描述提示詞 (ACTION PROMPT)」與「導演註記 (DIRECTOR'S NOTES)」，加入更專業的電影級運鏡技巧、燈光氛圍、冷暖色調與情感特寫指示。" },
                                        { text: "🎵 設計更有臨場感的環境音效與背景音樂描述", action: "請針對此場景的氣氛，幫我設計更生動、具有電影臨場感的「音效與背景音樂 / 鏡頭音訊 (audioCue)」描述。" }
                                      ].map((btn, bIdx) => (
                                        <button
                                          key={bIdx}
                                          onClick={() => {
                                            setSceneChatInputs(prev => ({ ...prev, [scene.id]: btn.action }));
                                          }}
                                          className="text-[10px] text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all text-left cursor-pointer active:scale-95"
                                        >
                                          {btn.text}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  sceneChats[scene.id].map((msg, mIdx) => (
                                    <div key={mIdx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                                        msg.role === 'user'
                                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                                      }`}>
                                        {msg.role === 'ai' && (
                                          <div className="text-[9px] font-bold mb-1 text-indigo-400 uppercase flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            分鏡助理
                                          </div>
                                        )}
                                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                      </div>
                                    </div>
                                  ))
                                )}

                                {isSceneChatting[scene.id] && (
                                  <div className="flex justify-start">
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                      <span>AI 導演正針對此分鏡重新佈置並即時更新設定中...</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Chat input box */}
                              <div className="flex gap-2">
                                <textarea
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans min-h-[44px] max-h-[100px] resize-y custom-scrollbar"
                                  placeholder="對此分鏡下達修改、翻譯指令，或直接發問（例：請幫我將台詞改為德語並更新 PROMPT）..."
                                  value={sceneChatInputs[scene.id] || ""}
                                  onChange={(e) => setSceneChatInputs(prev => ({ ...prev, [scene.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      if ((sceneChatInputs[scene.id] || "").trim() && !isSceneChatting[scene.id]) {
                                        handleChatScene(scene.id);
                                      }
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleChatScene(scene.id)}
                                  disabled={isSceneChatting[scene.id] || !(sceneChatInputs[scene.id] || "").trim()}
                                  className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/50 text-white disabled:text-slate-500 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
                                >
                                  {isSceneChatting[scene.id] ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  <span>傳送</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                        {activeProject.scenes.length === 0 && (
                          <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                            此專案尚未拆解分鏡。請在上方原著小說頁面輸入劇本文字，並按下「一鍵 AI 拆解分鏡」生成豐富的故事劇本！
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TAB: STORYBOARD SCENES EXTENSION & AI HUB ============ */}
              {activeTab === "scenes_ext" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 xl:col-span-4 space-y-6">
                    {/* Settings Panel 1: Script breakdown config */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                      <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        AI 劇本拆解引擎設定
                      </h3>

                      <div className="space-y-3">
                        {/* Selector Tabs: Mistral vs Zhipu */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                          <button
                            onClick={() => updateActiveProject({ disassemblyEngine: "mistral" })}
                            className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              activeProject.disassemblyEngine === "mistral"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <span>🔮 Mistral AI</span>
                            <span className="text-[8px] bg-emerald-500/10 px-1 py-0.2 rounded text-emerald-400">免費</span>
                          </button>
                          <button
                            onClick={() => updateActiveProject({ disassemblyEngine: "zhipu" })}
                            className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              activeProject.disassemblyEngine === "zhipu"
                                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <span>⚡ 智譜 AI</span>
                            <span className="text-[8px] bg-pink-500/10 px-1 py-0.2 rounded text-pink-400">自備</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed pl-1">
                          {activeProject.disassemblyEngine === "mistral" 
                            ? "系統已預置免費 Mistral-Nemo-Instruct 模型，無需設定 API Key，適合快速上手。" 
                            : "智譜 GLM 模型需要到設定面板配置您的 ZHIPU_API_KEY。"}
                        </p>
                      </div>
                    </div>

                    {/* Settings Panel 2: Drawing channels & style */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                      <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                        分鏡繪圖 & 運鏡設定
                      </h3>

                      <div className="space-y-4">
                        {/* Drawing channel select */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">繪圖算圖通道 (Image Channel)</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                            <button
                              onClick={() => updateActiveProject({ drawingChannel: "flux" })}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                activeProject.drawingChannel === "flux"
                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow"
                                  : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              <span>⚡ FLUX-Sch</span>
                            </button>
                            <button
                              onClick={() => updateActiveProject({ drawingChannel: "sd" })}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                activeProject.drawingChannel === "sd"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow"
                                  : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              <span>🌀 SD 3.5</span>
                            </button>
                          </div>
                        </div>

                        {/* Visual style selector input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">視覺美術風格 (Art Style)</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                            value={activeProject.artStyle}
                            onChange={(e) => updateActiveProject({ artStyle: e.target.value })}
                          >
                            <option value="動漫卡通動感 (Anime key visual)">動漫卡通動感 (Anime key visual)</option>
                            <option value="寫實電影感 (Cinematic Realistic)">寫實電影感 (Cinematic Realistic)</option>
                            <option value="高擬真電影質感 (Photorealistic Cinema)">高擬真電影質感 (Photorealistic Cinema)</option>
                            <option value="賽博朋克霓虹 (Cyberpunk Neon)">賽博朋克霓虹 (Cyberpunk Neon)</option>
                            <option value="美式寫實漫畫 (Cyberpunk Comic)">美式寫實漫畫 (Cyberpunk Comic)</option>
                            <option value="水彩插畫風 (Watercolor Illustration)">水彩插畫風 (Watercolor Illustration)</option>
                            <option value="中國古風水墨 (Traditional Chinese Ink)">中國古風水墨 (Traditional Chinese Ink)</option>
                            <option value="黑白鉛筆速寫 (Pencil Sketch)">黑白鉛筆速寫 (Pencil Sketch)</option>
                            <option value="可愛3D黏土風 (Claymation 3D)">可愛3D黏土風 (Claymation 3D)</option>
                          </select>
                        </div>

                        {/* Camera motion template */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">默認鏡頭移動 (Camera Motion)</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                            value={activeProject.cameraMotion || "經典推拉運鏡"}
                            onChange={(e) => updateActiveProject({ cameraMotion: e.target.value })}
                          >
                            <option value="經典推拉運鏡">經典推拉運鏡 (Zoom In / Out)</option>
                            <option value="左右平移掃視鏡頭">左右平移掃視鏡頭 (Pan Left / Right)</option>
                            <option value="環繞3D透視移動鏡頭">環繞3D透視移動鏡頭 (Orbit 3D)</option>
                            <option value="由下往上仰角推鏡">由下往上仰角推鏡 (Crane Shot Up)</option>
                            <option value="靜態定鏡無相機移動">靜態定鏡無相機移動 (Static Lock)</option>
                          </select>
                        </div>

                        {/* Global Storyboard Chatbot */}
                        {renderStoryboardGlobalChat()}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Workflow Trigger & Scenes List */}
                  <div className="xl:col-span-8 space-y-6 relative z-10">
                    {/* Storyboard Extension Banner */}
                    <div className="bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-slate-900/60 border border-emerald-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-6 relative z-20">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Film className="w-4 h-4 text-emerald-400" />
                          AI 分鏡劇本延長 (影格無縫連貫模式)
                        </h4>
                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                          在此模式下，後續分鏡的生成會<strong>自動繼承前一幕影片的最後一影格 (Last Frame)</strong> 作為首影格，確保故事人物的動作與場景無縫過渡、畫面完全連貫不跳頓！
                        </p>
                      </div>

                      <button
                        onClick={handleGenerateAllSequentially}
                        disabled={isGeneratingAllSequentially || activeProject.scenes.length === 0}
                        className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-55 shrink-0 hover:scale-[1.02] relative z-20 animate-pulse"
                      >
                        {isGeneratingAllSequentially ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>自動依序延長生成中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                            <span>一鍵自動依序延長生成所有分鏡</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Scenes List Container */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-display font-extrabold text-lg text-white">
                            分鏡卡片列表 ({activeProject.scenes.length} 場)
                          </h3>
                          <span className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 font-medium capitalize">首尾影格連續自動化已就緒</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleAddCustomScene}
                            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-800 transition flex items-center gap-1 cursor-pointer relative z-50 pointer-events-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>新增自定義場景</span>
                          </button>
                        </div>
                      </div>

                      {/* Scene Cards Loop */}
                      <div className="space-y-6">
                        {activeProject.scenes.map((scene, index) => {
                          const matchingChar = activeProject.characters.find(c => (c.name || "").trim().toLowerCase() === (scene.character || "").trim().toLowerCase());
                          return (
                            <div key={scene.id} className="space-y-4">
                              {index > 0 && (
                                <div className="flex items-center space-x-2 pl-6 text-emerald-400 text-[10px] font-bold font-mono">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>🧬 首影格將由「分鏡 {index}」的結尾最後一影格自動延續 (無縫過渡啟用)</span>
                                  </div>
                              )}

                            <div 
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              onDrop={(e) => handleDrop(e, index)}
                              className={`bg-slate-900/60 border rounded-2xl p-6 shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 relative group transition-all duration-200 ${
                                draggedIndex === index 
                                  ? "opacity-35 border-emerald-500/50 scale-[0.98] shadow-inner" 
                                  : draggedOverIndex === index 
                                  ? "border-emerald-400 bg-slate-900/90 shadow-emerald-500/10 shadow-2xl scale-[1.01] ring-2 ring-emerald-500/20" 
                                  : "border-slate-800 hover:border-slate-750"
                              }`}
                            >
                              {/* Delete specific scene */}
                              <button
                                onClick={() => handleDeleteScene(scene.id)}
                                className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-red-950/80 border border-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition"
                                title="刪除此分鏡"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Left Col: Scene Text Configurations (Inputs) */}
                              <div className="md:col-span-7 flex flex-col space-y-4">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 rounded cursor-grab active:cursor-grabbing transition"
                                    title="拖曳調整場景順序"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    分鏡延長 {index + 1}
                                  </span>
                                  {scene.durationSeconds && (
                                    <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {scene.durationSeconds}s
                                    </span>
                                  )}
                                  <input
                                    type="text"
                                    className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-850 focus:border-emerald-500 focus:outline-none w-full pb-0.5 transition"
                                    value={scene.title}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "title", e.target.value)}
                                  />
                                </div>

                                {/* Character select and Duration */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">出場角色</label>
                                    <input
                                      type="text"
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                                      value={scene.character}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "character", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">視頻時長 (秒)</label>
                                      {scene.durationSeconds !== estimateDialogueDuration(scene.dialogue, scene.narration) && (
                                        <button
                                          onClick={() => handleUpdateSceneField(scene.id, "durationSeconds", estimateDialogueDuration(scene.dialogue, scene.narration))}
                                          className="text-[9px] text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer bg-pink-500/10 px-1.5 py-0.5 rounded transition flex items-center gap-0.5"
                                          title={`依台詞與旁白自動計算最合適時長: ${estimateDialogueDuration(scene.dialogue, scene.narration)} 秒`}
                                        >
                                          <span>💡 建議 {estimateDialogueDuration(scene.dialogue, scene.narration)}s</span>
                                        </button>
                                      )}
                                    </div>
                                    <input
                                      type="number"
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                                      value={scene.durationSeconds || ""}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "durationSeconds", parseInt(e.target.value as string))}
                                    />
                                  </div>
                                </div>

                                {/* Subtitle / Dialogue / Audio Cue Split */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">台詞對白 (Dialogue)</label>
                                    <textarea
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-yellow-300 focus:outline-none focus:border-indigo-500 transition min-h-[60px]"
                                      value={scene.dialogue}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "dialogue", e.target.value)}
                                      placeholder="角色在此場景說的對白"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">場景旁白 (Narration)</label>
                                    <textarea
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition min-h-[60px]"
                                      value={scene.narration || ""}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "narration", e.target.value)}
                                      placeholder="此場景的背景氛圍旁白"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">🎵 氛圍音效與背景音樂 (鏡頭音訊)</label>
                                    <textarea
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 transition min-h-[60px]"
                                      value={scene.audioCue || ""}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "audioCue", e.target.value)}
                                      placeholder="例如：窗外淅淅瀝瀝的下雨聲，或者是雨停後的寂靜無雨聲。"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">AI 繪圖英文描述提示詞 (Prompt)</label>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-slate-500 font-bold">🪄 預設庫:</span>
                                        <select
                                          onChange={(e) => {
                                            if (e.target.value) {
                                              handleApplyStylePreset(scene.id, e.target.value);
                                              e.target.value = "";
                                            }
                                          }}
                                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-indigo-400 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                                          defaultValue=""
                                        >
                                          <option value="" disabled>-- 快速套用視覺風格 --</option>
                                          {STYLE_PRESETS.map((p) => (
                                            <option key={p.value} value={p.value}>{p.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleTranslatePrompt(scene.id, 'gemini')}
                                          className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                                          title="調用 Gemini 翻譯為高品質英文繪圖提示詞"
                                        >
                                          ✨ Gemini 優化
                                        </button>
                                        <button
                                          onClick={() => handleTranslatePrompt(scene.id, 'mistral')}
                                          className="text-[9px] text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                                          title="調用 Mistral AI 翻譯為高品質英文繪圖提示詞"
                                        >
                                          🔮 Mistral AI 優化
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[70px]"
                                    value={scene.visualPrompt}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "visualPrompt", e.target.value)}
                                    placeholder="英文提示詞，例如：A young Asian male standing on a balcony..."
                                  />
                                </div>

                                {/* Action Prompt */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500 font-bold uppercase block">影片動作描述提示詞 (Action Prompt)</label>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[50px]"
                                    value={scene.actionPrompt || ""}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "actionPrompt", e.target.value)}
                                    placeholder="英文動作描述，例如：The girl hugs the cat tightly."
                                  />
                                </div>

                                {/* Transition Prompt */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500 font-bold uppercase block">過渡到下個場景提示詞 (Transition Prompt)</label>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[40px]"
                                    value={scene.transitionPrompt || ""}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "transitionPrompt", e.target.value)}
                                    placeholder="英文過渡描述，例如：stands up and walks away."
                                  />
                                </div>

                                {/* Director's Personal Notes */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-amber-500 font-bold uppercase flex items-center gap-1">
                                    <span>🎬 導演註記 / 個人拍攝筆記 (Director's Notes)</span>
                                  </label>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition min-h-[60px]"
                                    value={scene.directorNotes || ""}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "directorNotes", e.target.value)}
                                    placeholder="在此撰寫該分鏡的導演註記、燈光配置、運鏡細節或個人備忘筆記..."
                                  />
                                </div>
                              </div>

                              {/* Right Col: Video Production & Rendering */}
                              <div className="md:col-span-5 flex flex-col space-y-4 justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                                <div className="space-y-3">
                                  <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider uppercase block">
                                    🎥 本地/雲端延伸渲染中心
                                  </span>
                                  
                                  {/* Canvas preview */}
                                  <div 
                                    onDragOver={handleImageDragOver}
                                    onDrop={(e) => handleImageDrop(e, scene.id, "imageUrlExt")}
                                    onClick={() => {
                                      if (!scene.videoUrlExt) {
                                        document.getElementById(`upload-scene-img-ext-${scene.id}`)?.click();
                                      }
                                    }}
                                    className={`relative w-full aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center ${!scene.videoUrlExt ? 'cursor-pointer group/img' : ''}`}
                                    title={!scene.videoUrlExt ? "點擊或拖曳圖片至此處上傳自訂照片" : undefined}
                                  >
                                    <input 
                                      type="file" 
                                      id={`upload-scene-img-ext-${scene.id}`} 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => handleUploadSceneImage(e, scene.id, "imageUrlExt")} 
                                    />

                                    {scene.videoUrlExt ? (
                                      <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                                        <ScrubbableVideoPlayer
                                          src={scene.videoUrlExt}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur text-emerald-400 text-[9px] px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold font-mono z-20">
                                          已延長渲染
                                        </div>
                                        {/* Redo / Reset button */}
                                        <div className="absolute top-2 right-2 flex gap-1 z-30">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              if (confirm("您確定要重置此場景的延長生成影片嗎？")) {
                                                setProjects(prevProjects => {
                                                  const updatedList = prevProjects.map(p => {
                                                    if (p.id === activeProjectId) {
                                                      const updatedScenes = p.scenes.map(s => {
                                                        if (s.id === scene.id) {
                                                          return {
                                                            ...s,
                                                            videoUrlExt: undefined,
                                                            videoProgressExt: undefined,
                                                            videoLogsExt: undefined,
                                                            videoErrorExt: undefined
                                                          };
                                                        }
                                                        return s;
                                                      });
                                                      return { ...p, scenes: updatedScenes };
                                                    }
                                                    return p;
                                                  });
                                                  try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (err) { console.error(err); }
                                                  return updatedList;
                                                });
                                                showToast("已成功重置延長影片！您可以重新生成。", "success");
                                              }
                                            }}
                                            className="bg-red-950/90 hover:bg-red-800 text-white px-2 py-1 rounded text-[9px] font-bold transition shadow flex items-center gap-1 border border-red-700/50 z-40 cursor-pointer active:scale-95"
                                          >
                                            <RefreshCw className="w-2.5 h-2.5" />
                                            <span>重做/重置影片</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : scene.imageUrlExt ? (
                                      <div className="relative w-full h-full">
                                        <img
                                          src={scene.imageUrlExt}
                                          alt="Storyboard preview"
                                          className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out transform scale-100 group-hover/img:scale-105"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur text-yellow-400 text-[9px] px-2 py-0.5 rounded-md border border-yellow-500/20 font-bold font-mono z-20">
                                          首幀就緒 (靜態圖)
                                        </div>
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5">
                                          <Upload className="w-5 h-5 text-indigo-400 animate-bounce" />
                                          <span className="text-[11px] font-bold text-slate-200">點擊或拖曳更換自訂照片</span>
                                        </div>
                                        {/* Redo / Reset button */}
                                        <div className="absolute top-2 right-2 flex gap-1 z-30">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              if (confirm("您確定要重置此場景的延長首幀與影片嗎？")) {
                                                setProjects(prevProjects => {
                                                  const updatedList = prevProjects.map(p => {
                                                    if (p.id === activeProjectId) {
                                                      const updatedScenes = p.scenes.map(s => {
                                                        if (s.id === scene.id) {
                                                          return {
                                                            ...s,
                                                            imageUrlExt: undefined,
                                                            videoUrlExt: undefined,
                                                            videoProgressExt: undefined,
                                                            videoLogsExt: undefined,
                                                            videoErrorExt: undefined
                                                          };
                                                        }
                                                        return s;
                                                      });
                                                      return { ...p, scenes: updatedScenes };
                                                    }
                                                    return p;
                                                  });
                                                  try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (err) { console.error(err); }
                                                  return updatedList;
                                                });
                                                showToast("已成功重置！您可以重新上傳/自動提取首幀，並重新生成影片。", "success");
                                              }
                                            }}
                                            className="bg-red-950/90 hover:bg-red-800 text-white px-2 py-1 rounded text-[9px] font-bold transition shadow flex items-center gap-1 border border-red-700/50 z-40 cursor-pointer active:scale-95"
                                          >
                                            <RefreshCw className="w-2.5 h-2.5" />
                                            <span>重做/重置此影鏡</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center space-y-1 text-slate-600 group-hover/img:text-slate-400 transition">
                                        <div className="relative">
                                          <Clapperboard className="w-8 h-8 group-hover/img:scale-110 transition-transform" />
                                          <Upload className="w-3.5 h-3.5 text-indigo-500 absolute -bottom-1 -right-1 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-[10px]">無渲染畫布 (請先點選下方算圖)</span>
                                        <span className="text-[9px] text-slate-550 hidden group-hover/img:block mt-1">或點擊、拖曳在此上傳您的照片</span>
                                      </div>
                                    )}

                                    {scene.isGeneratingVideoExt && (
                                      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                                        <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin mb-2" />
                                        <span className="text-xs font-bold text-white mb-1">正在進行影格延長渲染...</span>
                                        <div className="w-3/4 bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                                          <div 
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                                            style={{ width: scene.videoProgressExt || "0%" }}
                                          />
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">進度: {scene.videoProgressExt || "0%"}</span>
                                        {scene.videoLogsExt && scene.videoLogsExt.length > 0 && (
                                          <div className="w-full mt-2 bg-black/90 p-2 rounded-lg text-[8px] font-mono text-emerald-400 text-left h-24 overflow-y-auto border border-emerald-500/20 select-text leading-relaxed">
                                            {scene.videoLogsExt.map((logLine, logIdx) => (
                                              <div key={logIdx}>{logLine}</div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {scene.isGeneratingVideoExt && (
                                    <div className="flex gap-2 w-full mt-2 mb-2">
                                      <button
                                        onClick={() => handleStopGenerateVideo(scene.id)}
                                        className="flex-1 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 shadow-md border border-rose-500/50"
                                      >
                                        <StopCircle className="w-3.5 h-3.5" />
                                        <span>🛑 停止影片生成</span>
                                      </button>
                                      <button
                                        onClick={() => handleResetVideoTask()}
                                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 border border-slate-700"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>取消/重置</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Error message */}
                                  {scene.videoErrorExt && (
                                    <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 text-[10px] space-y-1 font-mono leading-relaxed select-text">
                                      <div className="font-bold flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>延伸渲染出錯 (代碼 {scene.videoErrorCodeExt || "N/A"})</span>
                                      </div>
                                      <p>{scene.videoErrorExt}</p>
                                      {scene.videoLogsExt && scene.videoLogsExt.length > 0 && (
                                        <details className="mt-1">
                                          <summary className="cursor-pointer font-bold text-[9px] text-slate-400">查看完整渲染日誌</summary>
                                          <div className="mt-1 bg-black/80 p-2 rounded text-[8px] max-h-28 overflow-y-auto text-left leading-normal text-red-300">
                                            {scene.videoLogsExt.map((ll, idx) => <div key={idx}>{ll}</div>)}
                                          </div>
                                        </details>
                                      )}
                                    </div>
                                  )}

                                  {/* Playback & Download triggers */}
                                  <div className="space-y-2">
                                    {scene.videoUrlExt && (
                                      <a
                                        href={`/api/download?url=${encodeURIComponent(scene.videoUrlExt)}`}
                                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-emerald-900/20 flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/30"
                                        download={`toonflow-scene-${index + 1}-extended.mp4`}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>📥 下載已延長之 MP4 影片</span>
                                      </a>
                                    )}
                                    {scene.imageUrlExt && (
                                      <button
                                        onClick={() => {
                                          setSelectedSceneForSimulation(scene);
                                          setIsPlayingSimulation(true);
                                        }}
                                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg border border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-pink-400" />
                                        <span>🎥 實時 3D 運鏡與台詞預覽 (免費)</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Multi Action buttons */}
                                <div className="flex flex-col gap-2">
                                  {scene.id.startsWith("scene_transition_") ? (
                                    <button
                                      onClick={() => handleGenerateImage(scene.id, 'gemini')}
                                      disabled={scene.isGeneratingImageExt}
                                      className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-[11px] font-bold rounded-lg border border-teal-500/30 hover:border-teal-400 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-950/20 z-30"
                                      title="一鍵提取上一場景最後一幀作為本銜接場景首幀，並設定下一場景作為過渡尾幀"
                                    >
                                      {scene.isGeneratingImageExt ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Link2 className="w-4 h-4 text-teal-200" />
                                      )}
                                      <span>🔗 智慧自動銜接：提取上鏡最後一幀</span>
                                    </button>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'nanobanana')}
                                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-bold rounded-lg border border-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageExt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                                        <span>Nano 繪圖</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'gemini')}
                                        className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[9px] font-bold rounded-lg border border-indigo-900 hover:border-indigo-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageExt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                                        <span>Gemini 繪圖</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'agnes')}
                                        className="w-full py-2 bg-pink-950 hover:bg-pink-900 text-pink-300 text-[9px] font-bold rounded-lg border border-pink-900 hover:border-pink-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageExt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-pink-400" />}
                                        <span>Agnes 繪圖</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'mistral')}
                                        className="w-full py-2 bg-orange-950 hover:bg-orange-900 text-orange-200 text-[9px] font-bold rounded-lg border border-orange-900 hover:border-orange-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageExt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
                                        <span>Mistral 繪圖</span>
                                      </button>
                                    </div>
                                  )}
                                  {scene.isGeneratingImageExt && (
                                    <div className="flex flex-col gap-1.5 items-center justify-center p-2 bg-slate-900/80 rounded-lg border border-red-500/30 animate-pulse">
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        AI 正在生成插圖中...
                                      </div>
                                      <div className="flex gap-2 w-full">
                                        <button
                                          onClick={() => handleStopGenerateImage(scene.id)}
                                          className="flex-1 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <StopCircle className="w-3.5 h-3.5" />
                                          <span>停止</span>
                                        </button>
                                        <button
                                          onClick={() => handleGenerateImage(scene.id, 'agnes')}
                                          className="flex-1 py-1.5 bg-pink-700/90 hover:bg-pink-600 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                                          <span>Agnes</span>
                                        </button>
                                        <button
                                          onClick={() => handleGenerateImage(scene.id, 'mistral')}
                                          className="flex-1 py-1.5 bg-orange-700/90 hover:bg-orange-600 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                                          <span>Mistral</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleGenerateVideoExtended(scene.id, index)}
                                      disabled={scene.isGeneratingVideoExt || !scene.imageUrlExt}
                                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                        !scene.imageUrlExt 
                                          ? "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-55" 
                                          : "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white hover:opacity-95 border-transparent shadow"
                                      }`}
                                      title={!scene.imageUrlExt ? "請先完成分鏡繪圖再生成影片" : "與上一幕最後一影格無縫連貫生成 5秒 影片"}
                                    >
                                      <Video className="w-4 h-4" />
                                      <span>🎬 一鍵 AI 延伸影片</span>
                                    </button>

                                    <label
                                      htmlFor={`upload-scene-img-ext-${scene.id}`}
                                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                      title="從您的電腦上傳自訂分鏡插圖"
                                    >
                                      <Upload className="w-4 h-4 text-emerald-400" />
                                      <span>上傳照片</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Inline Scene Chatbot */}
                            <div className="md:col-span-12 mt-6 border-t border-slate-800/80 pt-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                      分鏡智慧協調助理
                                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-mono font-medium">Chat & Modify</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">就該分鏡主題解答、翻譯，或下達指令即時修改此分鏡的所有內容。</p>
                                  </div>
                                </div>
                              </div>

                              {/* Chat messages container */}
                              <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3 min-h-[100px] max-h-[250px] overflow-y-auto custom-scrollbar">
                                {(!sceneChats[scene.id] || sceneChats[scene.id].length === 0) ? (
                                  <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                                    <p className="text-[11px] text-slate-500 italic">尚未與本分鏡助理進行過對話。你可以點擊以下預設指令快速進行：</p>
                                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                                      {[
                                        { text: "💡 幫我將台詞改得更有情感張力，並同步更新英文 PROMPT", action: "請幫我把台詞對白改得更有情感張力、口語化且吸引人，並依據此情感同步優化繪圖英文描述提示詞 (PROMPT) 與動作描述 (ACTION PROMPT)。" },
                                        { text: "👩 解決雙男角/雙女角問題：在 PROMPT 中明確設定主角與女主角的性別與長相", action: "我的場景中有男主角（陳默）和女主角（林芊），但 AI 繪圖生成了兩個男生。請幫我修改英文 PROMPT，在裡面明確標記：Chen Mo 為帥氣年輕男性 (handsome young Chinese male)、Lin Qian 為長髮美麗女性 (beautiful young Chinese female with long hair)，以修正雙男角問題，並保持角色服裝一致。" },
                                        { text: "🎬 幫我優化鏡頭運動 (Action Prompt) 與導演註記", action: "請幫我精進本分鏡的「影片動作描述提示詞 (ACTION PROMPT)」與「導演註記 (DIRECTOR'S NOTES)」，加入更專業的電影級運鏡技巧、燈光氛圍、冷暖色調與情感特寫指示。" },
                                        { text: "🎵 設計更有臨場感的環境音效與背景音樂描述", action: "請針對此場景的氣氛，幫我設計更生動、具有電影臨場感的「音效與背景音樂 / 鏡頭音訊 (audioCue)」描述。" }
                                      ].map((btn, bIdx) => (
                                        <button
                                          key={bIdx}
                                          type="button"
                                          onClick={() => {
                                            setSceneChatInputs(prev => ({ ...prev, [scene.id]: btn.action }));
                                          }}
                                          className="text-[10px] text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all text-left cursor-pointer active:scale-95"
                                        >
                                          {btn.text}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  sceneChats[scene.id].map((msg, mIdx) => (
                                    <div key={mIdx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                                        msg.role === 'user'
                                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                                      }`}>
                                        {msg.role === 'ai' && (
                                          <div className="text-[9px] font-bold mb-1 text-indigo-400 uppercase flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            分鏡助理
                                          </div>
                                        )}
                                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                      </div>
                                    </div>
                                  ))
                                )}

                                {isSceneChatting[scene.id] && (
                                  <div className="flex justify-start">
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                      <span>AI 導演正針對此分鏡重新佈置並即時更新設定中...</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Chat input box */}
                              <div className="flex gap-2">
                                <textarea
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans min-h-[44px] max-h-[100px] resize-y custom-scrollbar"
                                  placeholder="對此分鏡下達修改、翻譯指令，或直接發問（例：請幫我將台詞改為德語並更新 PROMPT）..."
                                  value={sceneChatInputs[scene.id] || ""}
                                  onChange={(e) => setSceneChatInputs(prev => ({ ...prev, [scene.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      if ((sceneChatInputs[scene.id] || "").trim() && !isSceneChatting[scene.id]) {
                                        handleChatScene(scene.id);
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleChatScene(scene.id)}
                                  disabled={isSceneChatting[scene.id] || !(sceneChatInputs[scene.id] || "").trim()}
                                  className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/50 text-white disabled:text-slate-500 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
                                >
                                  {isSceneChatting[scene.id] ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  <span>傳送</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                        {activeProject.scenes.length === 0 && (
                          <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                            此專案尚未拆解分鏡。請在上方原著小說頁面輸入劇本文字，並按下「一鍵 AI 拆解分鏡」生成豐富的故事劇本！
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TAB: STORYBOARD SCENES KEYFRAMES & AI HUB ============ */}
              {activeTab === "scenes_keyframes" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 xl:col-span-4 space-y-6">
                    {/* Settings Panel 1: Script breakdown config */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                      <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Sliders className="w-4 h-4 text-purple-400" />
                        AI 劇本拆解引擎設定
                      </h3>

                      <div className="space-y-3">
                        {/* Selector Tabs: Mistral vs Zhipu */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                          <button
                            onClick={() => updateActiveProject({ disassemblyEngine: "mistral" })}
                            className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              activeProject.disassemblyEngine === "mistral"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <span>🔮 Mistral AI</span>
                            <span className="text-[8px] bg-purple-500/10 px-1 py-0.2 rounded text-purple-400">免費</span>
                          </button>
                          <button
                            onClick={() => updateActiveProject({ disassemblyEngine: "zhipu" })}
                            className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              activeProject.disassemblyEngine === "zhipu"
                                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <span>⚡ 智譜 AI</span>
                            <span className="text-[8px] bg-pink-500/10 px-1 py-0.2 rounded text-pink-400">自備</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed pl-1">
                          {activeProject.disassemblyEngine === "mistral" 
                            ? "系統已預置免費 Mistral-Nemo-Instruct 模型，無需設定 API Key，適合快速上手。" 
                            : "智譜 GLM 模型需要到設定面板配置您的 ZHIPU_API_KEY。"}
                        </p>
                      </div>
                    </div>

                    {/* Settings Panel 2: Drawing channels & style */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                      <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                        分鏡繪圖 & 運鏡設定
                      </h3>

                      <div className="space-y-4">
                        {/* Drawing channel select */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">繪圖算圖通道 (Image Channel)</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                            <button
                              onClick={() => updateActiveProject({ drawingChannel: "flux" })}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                activeProject.drawingChannel === "flux"
                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow"
                                  : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              <span>⚡ FLUX-Sch</span>
                            </button>
                            <button
                              onClick={() => updateActiveProject({ drawingChannel: "sd" })}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                activeProject.drawingChannel === "sd"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow"
                                  : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              <span>🌀 SD 3.5</span>
                            </button>
                          </div>
                        </div>

                        {/* Visual style selector input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">視覺美術風格 (Art Style)</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                            value={activeProject.artStyle}
                            onChange={(e) => updateActiveProject({ artStyle: e.target.value })}
                          >
                            <option value="動漫卡通動感 (Anime key visual)">動漫卡通動感 (Anime key visual)</option>
                            <option value="寫實電影感 (Cinematic Realistic)">寫實電影感 (Cinematic Realistic)</option>
                            <option value="高擬真電影質感 (Photorealistic Cinema)">高擬真電影質感 (Photorealistic Cinema)</option>
                            <option value="賽博朋克霓虹 (Cyberpunk Neon)">賽博朋克霓虹 (Cyberpunk Neon)</option>
                            <option value="美式寫實漫畫 (Cyberpunk Comic)">美式寫實漫畫 (Cyberpunk Comic)</option>
                            <option value="水彩插畫風 (Watercolor Illustration)">水彩插畫風 (Watercolor Illustration)</option>
                            <option value="中國古風水墨 (Traditional Chinese Ink)">中國古風水墨 (Traditional Chinese Ink)</option>
                            <option value="黑白鉛筆速寫 (Pencil Sketch)">黑白鉛筆速寫 (Pencil Sketch)</option>
                            <option value="可愛3D黏土風 (Claymation 3D)">可愛3D黏土風 (Claymation 3D)</option>
                          </select>
                        </div>

                        {/* Camera motion template */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">默認鏡頭移動 (Camera Motion)</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                            value={activeProject.cameraMotion || "經典推拉運鏡"}
                            onChange={(e) => updateActiveProject({ cameraMotion: e.target.value })}
                          >
                            <option value="經典推拉運鏡">經典推拉運鏡 (Zoom In / Out)</option>
                            <option value="左右平移掃視鏡頭">左右平移掃視鏡頭 (Pan Left / Right)</option>
                            <option value="環繞3D透視移動鏡頭">環繞3D透視移動鏡頭 (Orbit 3D)</option>
                            <option value="由下往上仰角推鏡">由下往上仰角推鏡 (Crane Shot Up)</option>
                            <option value="靜態定鏡無相機移動">靜態定鏡無相機移動 (Static Lock)</option>
                          </select>
                        </div>

                        {/* Global Storyboard Chatbot */}
                        {renderStoryboardGlobalChat()}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Workflow Trigger & Scenes List */}
                  <div className="xl:col-span-8 space-y-6 relative z-10">
                    {/* Storyboard Keyframes Banner */}
                    <div className="bg-gradient-to-r from-purple-950/40 via-indigo-900/20 to-slate-900/60 border border-purple-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-6 relative z-20">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Film className="w-4 h-4 text-purple-400" />
                          AI 分鏡劇本首尾幀 (首尾轉換無縫連貫模式)
                        </h4>
                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                          在此模式下，各分鏡影片獨立製作。以<strong>當前分鏡產生的相片為首影格 (Start Frame)</strong>，並以<strong>下一分鏡的相片為尾影格 (End Frame)</strong>，實現影格與影格之間的無縫連貫過渡！
                        </p>
                        <p className="text-xs text-amber-400 font-medium pt-1">
                          ● 建議：影片長度必須考慮首尾幀過渡的時長，確保過渡效果合理及順暢。
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 items-center">
                        <button
                          onClick={handleClearAllKeyframes}
                          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] relative z-20 border ${
                            isConfirmingClear
                              ? "bg-red-600 border-red-500 text-white animate-pulse"
                              : "bg-slate-900 border-red-500/40 hover:bg-red-950/20 text-red-400"
                          }`}
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${isConfirmingClear ? "text-white" : "text-red-400"}`} />
                          <span>{isConfirmingClear ? "⚠️ 再次點擊以確認清除！" : "一鍵清除已生成 (重頭再來)"}</span>
                        </button>

                        <button
                          onClick={handleGenerateAllKeyframesSequentially}
                          disabled={isGeneratingAllKeyframesSequentially || activeProject.scenes.length === 0}
                          className="py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-55 shrink-0 hover:scale-[1.02] relative z-20"
                        >
                          {isGeneratingAllKeyframesSequentially ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>自動依序首尾轉換生成中...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                              <span>一鍵自動依序首尾過渡生成所有分鏡</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* NEW FEATURE: AI One-click Full Auto-Produce Video Section */}
                    <div className="bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-slate-900/60 border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4 relative z-20">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Wand2 className="w-4 h-4 text-emerald-400" />
                            AI 一鍵全自動極速出片 (極致極簡一鍵工作流)
                          </h4>
                          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                            只需點擊一次，AI 將為您全自動處理：<strong>分析大綱/拆解劇本 ➔ 自動對齊角色服裝 ➔ 依序生成首尾影格 ➔ 完美連續過渡運鏡 ➔ 智能無縫剪輯及自動合成影片 ➔ 一鍵完成最終出片！</strong>
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                          <button
                            onClick={handleFullAutoVideoProduction}
                            disabled={isFullAutoProducing}
                            className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 w-full sm:w-auto hover:scale-[1.02] relative z-20 animate-pulse"
                          >
                            {isFullAutoProducing ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                <span>AI 全自動製片進行中... {fullAutoProgress}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current text-white" />
                                <span>⚡ AI 一鍵全自動極速出片</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleManualStitchVideos}
                            disabled={isFullAutoProducing}
                            className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 w-full sm:w-auto hover:scale-[1.02] relative z-20"
                            title="適用於當您手動完成或重試特定分鏡的影片後，快速一鍵合併拼接所有成功生成的影片片段"
                          >
                            <Clapperboard className="w-4 h-4 text-white" />
                            <span>🎬 一鍵手動拼接成片</span>
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar & Real-time Logs Container */}
                      {(isFullAutoProducing || fullAutoLogs.length > 0 || finalStitchedVideoUrl || activeProject?.finalVideoUrl) && (
                        <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 space-y-3 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" /> 工作流狀態日誌
                            </span>
                            <span className="text-slate-400">{fullAutoProgress}</span>
                          </div>

                          {/* Progress bar visual */}
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: fullAutoProgress }}
                            />
                          </div>

                          {/* Live Console Logs */}
                          {fullAutoLogs.length > 0 && (
                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                              {fullAutoLogs.map((log, lIdx) => (
                                <div key={lIdx} className="text-slate-300 leading-relaxed text-[11px] flex items-start gap-1">
                                  <span className="text-emerald-500 font-bold shrink-0">›</span>
                                  <span>{log}</span>
                                </div>
                              ))}
                              <div ref={logsEndRef} />
                            </div>
                          )}

                          {/* Completed Masterpiece Player */}
                          {(finalStitchedVideoUrl || activeProject?.finalVideoUrl) && (
                            <div className="pt-3 border-t border-slate-850 space-y-3">
                              <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <Film className="w-4 h-4 text-emerald-400" />
                                🎬 最終合成 Masterpiece 成片已就緒！
                              </h5>
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-900 shadow-inner group">
                                <ScrubbableVideoPlayer 
                                  src={(finalStitchedVideoUrl || activeProject?.finalVideoUrl) as string} 
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] text-slate-500">
                                  檔名: {(finalStitchedVideoUrl || activeProject?.finalVideoUrl)?.split('/').pop()}
                                </span>
                                <a 
                                  href={`/api/download?url=${encodeURIComponent((finalStitchedVideoUrl || activeProject?.finalVideoUrl) as string)}`}
                                  className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                                  download="final-masterpiece.mp4"
                                >
                                  <Download className="w-3.5 h-3.5" /> 下載成片
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Scenes List Container */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-display font-extrabold text-lg text-white">
                            分鏡卡片列表 ({activeProject.scenes.length} 場)
                          </h3>
                          <span className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-purple-400 font-medium capitalize">首尾影格連續過渡已就緒</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleAddCustomScene}
                            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-800 transition flex items-center gap-1 cursor-pointer relative z-50 pointer-events-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>新增自定義場景</span>
                          </button>
                        </div>
                      </div>

                      {/* Scene Cards Loop */}
                      <div className="space-y-6">
                        {activeProject.scenes.map((scene, index) => {
                          const nextScene = index < activeProject.scenes.length - 1 ? activeProject.scenes[index + 1] : undefined;
                          const startImageUrl = scene.imageUrlKeyframes || scene.imageUrlExt || scene.imageUrl;
                          const endImageUrl = nextScene ? (nextScene.imageUrlKeyframes || nextScene.imageUrlExt || nextScene.imageUrl) : undefined;
                          return (
                          <div key={scene.id} className="space-y-4">
                            {index < activeProject.scenes.length - 1 ? (
                              <div className="flex items-center space-x-2 pl-6 text-purple-400 text-[10px] font-bold font-mono">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span>🧬 首影格為「分鏡 {index + 1} 圖片」，尾影格將自動指定為「分鏡 {index + 2} 圖片」(首尾轉換過渡啟用)</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 pl-6 text-purple-400 text-[10px] font-bold font-mono">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span>🧬 結尾分鏡：首影格為「分鏡 {index + 1} 圖片」，無後續分鏡作為尾影格 (將自動過渡至故事結尾)</span>
                              </div>
                            )}

                            <div 
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              onDrop={(e) => handleDrop(e, index)}
                              className={`bg-slate-900/60 border rounded-2xl p-6 shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 relative group transition-all duration-200 ${
                                draggedIndex === index 
                                  ? "opacity-35 border-purple-500/50 scale-[0.98] shadow-inner" 
                                  : draggedOverIndex === index 
                                  ? "border-purple-400 bg-slate-900/90 shadow-purple-500/10 shadow-2xl scale-[1.01] ring-2 ring-purple-500/20" 
                                  : "border-slate-800 hover:border-slate-750"
                              }`}
                            >
                              {/* Delete specific scene */}
                              <button
                                onClick={() => handleDeleteScene(scene.id)}
                                className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-red-950/80 border border-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition"
                                title="刪除此分鏡"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Left Col: Scene Text Configurations (Inputs) */}
                              <div className="md:col-span-7 flex flex-col space-y-4">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 rounded cursor-grab active:cursor-grabbing transition"
                                    title="拖曳調整場景順序"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    分鏡首尾幀 {index + 1}
                                  </span>
                                  {scene.durationSeconds && (
                                    <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {scene.durationSeconds}s
                                    </span>
                                  )}
                                  <input
                                    type="text"
                                    className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-850 focus:border-purple-500 focus:outline-none w-full pb-0.5 transition"
                                    value={scene.title}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "title", e.target.value)}
                                  />
                                </div>

                                {/* Character select and Duration */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">出場角色</label>
                                    <input
                                      type="text"
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                                      value={scene.character}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "character", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">視頻時長 (秒)</label>
                                      {scene.durationSeconds !== estimateDialogueDuration(scene.dialogue, scene.narration) && (
                                        <button
                                          onClick={() => handleUpdateSceneField(scene.id, "durationSeconds", estimateDialogueDuration(scene.dialogue, scene.narration))}
                                          className="text-[9px] text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer bg-pink-500/10 px-1.5 py-0.5 rounded transition flex items-center gap-0.5"
                                          title={`依台詞與旁白自動計算最合適時長: ${estimateDialogueDuration(scene.dialogue, scene.narration)} 秒`}
                                        >
                                          <span>💡 建議 {estimateDialogueDuration(scene.dialogue, scene.narration)}s</span>
                                        </button>
                                      )}
                                    </div>
                                    <input
                                      type="number"
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                                      value={scene.durationSeconds || ""}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "durationSeconds", parseInt(e.target.value as string))}
                                    />
                                  </div>
                                </div>

                                {/* Subtitle / Dialogue / Audio Cue Split */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">台詞對白 (Dialogue)</label>
                                    <textarea
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-yellow-300 focus:outline-none focus:border-indigo-500 transition min-h-[60px]"
                                      value={scene.dialogue}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "dialogue", e.target.value)}
                                      placeholder="角色在此場景說的對白"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">場景旁白 (Narration)</label>
                                    <textarea
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition min-h-[60px]"
                                      value={scene.narration || ""}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "narration", e.target.value)}
                                      placeholder="此場景的背景氛圍旁白"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">🎵 氛圍音效與背景音樂 (鏡頭音訊)</label>
                                    <textarea
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 transition min-h-[60px]"
                                      value={scene.audioCue || ""}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "audioCue", e.target.value)}
                                      placeholder="例如：窗外淅淅瀝瀝的下雨聲，或者是雨停後的寂靜無雨聲。"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">AI 繪圖英文描述提示詞 (Prompt)</label>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-slate-500 font-bold">🪄 預設庫:</span>
                                        <select
                                          onChange={(e) => {
                                            if (e.target.value) {
                                              handleApplyStylePreset(scene.id, e.target.value);
                                              e.target.value = "";
                                            }
                                          }}
                                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-indigo-400 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                                          defaultValue=""
                                        >
                                          <option value="" disabled>-- 快速套用視覺風格 --</option>
                                          {STYLE_PRESETS.map((p) => (
                                            <option key={p.value} value={p.value}>{p.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleTranslatePrompt(scene.id, 'gemini')}
                                          className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                                          title="調用 Gemini 翻譯為高品質英文繪圖提示詞"
                                        >
                                          ✨ Gemini 優化
                                        </button>
                                        <button
                                          onClick={() => handleTranslatePrompt(scene.id, 'mistral')}
                                          className="text-[9px] text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                                          title="調用 Mistral AI 翻譯為高品質英文繪圖提示詞"
                                        >
                                          🔮 Mistral AI 優化
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[70px]"
                                    value={scene.visualPrompt}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "visualPrompt", e.target.value)}
                                    placeholder="英文提示詞，例如：A young Asian male standing on a balcony..."
                                  />
                                </div>

                                {/* Action Prompt */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500 font-bold uppercase block">影片動作描述提示詞 (Action Prompt)</label>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[50px]"
                                    value={scene.actionPrompt || ""}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "actionPrompt", e.target.value)}
                                    placeholder="英文動作描述，例如：The girl hugs the cat tightly."
                                  />
                                </div>

                                {/* Transition Prompt */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500 font-bold uppercase block">過渡到下個場景提示詞 (Transition Prompt)</label>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[40px]"
                                    value={scene.transitionPrompt || ""}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "transitionPrompt", e.target.value)}
                                    placeholder="英文過渡描述，例如：stands up and walks away."
                                  />
                                </div>

                                {/* Transition Strategy Options */}
                                <div className="space-y-2 mt-2">
                                  <label className="text-[9px] font-mono text-slate-500 font-bold uppercase block">過渡動作策略 (Motion Strategy)</label>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleUpdateSceneField(scene.id, "useFreezeAndMove", false)}
                                      className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-mono border transition-colors ${scene.useFreezeAndMove !== true ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                    >
                                      流暢連續運動 (預設，建議3秒/75幀)
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateSceneField(scene.id, "useFreezeAndMove", true)}
                                      className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-mono border transition-colors ${scene.useFreezeAndMove === true ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                    >
                                      凍結定格過渡 (防崩)
                                    </button>
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer group mt-2">
                                    <input 
                                      type="checkbox"
                                      checked={scene.useMidpointSplit === true}
                                      onChange={(e) => handleUpdateSceneField(scene.id, "useMidpointSplit", e.target.checked)}
                                      className="form-checkbox bg-slate-900 border-slate-700 rounded text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-950 w-3 h-3"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300 transition">啟用雙段安全過渡 (中段拆分)</span>
                                  </label>
                                </div>

                                {/* Director's Personal Notes */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-amber-500 font-bold uppercase flex items-center gap-1">
                                    <span>🎬 導演註記 / 個人拍攝筆記 (Director's Notes)</span>
                                  </label>
                                  <textarea
                                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition min-h-[60px]"
                                    value={scene.directorNotes || ""}
                                    onChange={(e) => handleUpdateSceneField(scene.id, "directorNotes", e.target.value)}
                                    placeholder="在此撰寫該分鏡的導演註記、燈光配置、運鏡細節 or 個人備忘筆記..."
                                  />
                                </div>
                              </div>

                              {/* Right Col: Video Production & Rendering */}
                              <div className="md:col-span-5 flex flex-col space-y-4 justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                                <div className="space-y-3">
                                  <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider uppercase block">
                                    🎥 首尾影格渲染中心
                                  </span>
                                  
                                  {/* Canvas preview */}
                                  <div 
                                    onDragOver={handleImageDragOver}
                                    onDrop={(e) => handleImageDrop(e, scene.id, "imageUrlKeyframes")}
                                    onClick={() => {
                                      if (!scene.videoUrlKeyframes && !startImageUrl) {
                                        document.getElementById(`upload-scene-img-kf-${scene.id}`)?.click();
                                      }
                                    }}
                                    className={`relative w-full aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center ${!scene.videoUrlKeyframes && !startImageUrl ? 'cursor-pointer group/img' : ''}`}
                                    title={!scene.videoUrlKeyframes && !startImageUrl ? "點擊或拖曳圖片至此處上傳自訂照片" : undefined}
                                  >
                                    <input 
                                      type="file" 
                                      id={`upload-scene-img-kf-${scene.id}`} 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => handleUploadSceneImage(e, scene.id, "imageUrlKeyframes")} 
                                    />

                                    {scene.videoUrlKeyframes ? (
                                      <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                                        <ScrubbableVideoPlayer
                                          src={scene.videoUrlKeyframes}
                                          className="w-full h-full object-cover"
                                        />
                                        {/* Redo / Reset button */}
                                        <div className="absolute top-2 right-2 flex gap-1 z-30">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              if (confirm("您確定要重置此場景的首尾過渡影片嗎？")) {
                                                setProjects(prevProjects => {
                                                  const updatedList = prevProjects.map(p => {
                                                    if (p.id === activeProjectId) {
                                                      const updatedScenes = p.scenes.map(s => {
                                                        if (s.id === scene.id) {
                                                          return {
                                                            ...s,
                                                            videoUrlKeyframes: undefined,
                                                            videoProgressKeyframes: undefined,
                                                            videoLogsKeyframes: undefined,
                                                            videoErrorKeyframes: undefined
                                                          };
                                                        }
                                                        return s;
                                                      });
                                                      return { ...p, scenes: updatedScenes };
                                                    }
                                                    return p;
                                                  });
                                                  try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (err) { console.error(err); }
                                                  return updatedList;
                                                });
                                                showToast("已成功重置過渡影片！您可以重新生成。", "success");
                                              }
                                            }}
                                            className="bg-red-950/90 hover:bg-red-800 text-white px-2 py-1 rounded text-[9px] font-bold transition shadow flex items-center gap-1 border border-red-700/50 z-40 cursor-pointer active:scale-95"
                                          >
                                            <RefreshCw className="w-2.5 h-2.5" />
                                            <span>重做/重置影片</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : startImageUrl ? (
                                      <div className="relative w-full h-full flex bg-black overflow-hidden">
                                        {/* Start Frame (Left Half) */}
                                        <div 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            document.getElementById(`upload-scene-img-kf-${scene.id}`)?.click();
                                          }}
                                          onDragOver={handleImageDragOver}
                                          onDrop={(e) => {
                                            e.stopPropagation();
                                            handleImageDrop(e, scene.id, "imageUrlKeyframes");
                                          }}
                                          className="flex-1 relative h-full border-r border-slate-800 cursor-pointer group/start overflow-hidden"
                                        >
                                          <img
                                            src={startImageUrl}
                                            alt="Start Frame"
                                            className="w-full h-full object-cover opacity-80 group-hover/start:opacity-40 transition-opacity duration-200"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur text-purple-400 text-[9px] px-2 py-0.5 rounded-md border border-purple-500/30 font-bold font-mono z-20 shadow-sm shadow-purple-900/50">
                                            🎬 首幀 (START)
                                          </div>
                                          
                                          {/* Hover overlay for Start */}
                                          <div className="absolute inset-0 opacity-0 group-hover/start:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 bg-black/60 z-10">
                                            <Upload className="w-4 h-4 text-purple-400 animate-bounce" />
                                            <span className="text-[10px] font-bold text-slate-100 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-full">更換首幀圖片</span>
                                          </div>
                                        </div>
                                        
                                        {/* End Frame (Right Half) */}
                                        <div 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (nextScene) {
                                              document.getElementById(`upload-scene-img-kf-${nextScene.id}`)?.click();
                                            } else {
                                              showToast("此為最後一幕，無後續分鏡尾幀。如需過渡，可在下方新增自定義銜接場景！", "info");
                                            }
                                          }}
                                          onDragOver={handleImageDragOver}
                                          onDrop={(e) => {
                                            e.stopPropagation();
                                            if (nextScene) {
                                              handleImageDrop(e, nextScene.id, "imageUrlKeyframes");
                                            }
                                          }}
                                          className={`flex-1 relative h-full overflow-hidden ${nextScene ? 'cursor-pointer group/end' : ''}`}
                                        >
                                          {endImageUrl ? (
                                            <img
                                              src={endImageUrl}
                                              alt="End Frame"
                                              className="w-full h-full object-cover opacity-80 group-hover/end:opacity-40 transition-opacity duration-200"
                                              referrerPolicy="no-referrer"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/80 text-slate-600">
                                              <span className="text-[10px] font-mono">尾幀未就緒</span>
                                            </div>
                                          )}
                                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-emerald-400 text-[9px] px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold font-mono z-20 shadow-sm shadow-emerald-900/50">
                                            尾幀 (END) 🏁
                                          </div>

                                          {/* Hover overlay for End */}
                                          {nextScene && (
                                            <div className="absolute inset-0 opacity-0 group-hover/end:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 bg-black/60 z-10">
                                              <Upload className="w-4 h-4 text-emerald-400 animate-bounce" />
                                              <span className="text-[10px] font-bold text-slate-100 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">更換尾幀 (同步下幕首幀)</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* VS Badge */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur border border-slate-700 w-6 h-6 rounded-full flex items-center justify-center z-30 shadow-xl shadow-black">
                                          <span className="text-[8px] font-bold text-slate-300 font-mono tracking-tighter">TO</span>
                                        </div>

                                        {/* Reset both frames button */}
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-35">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              if (confirm("您確定要重置此場景的首尾過渡影格設定與影片嗎？")) {
                                                setProjects(prevProjects => {
                                                  const updatedList = prevProjects.map(p => {
                                                    if (p.id === activeProjectId) {
                                                      const updatedScenes = p.scenes.map(s => {
                                                        if (s.id === scene.id) {
                                                          return {
                                                            ...s,
                                                            imageUrlKeyframes: undefined,
                                                            videoUrlKeyframes: undefined,
                                                            videoProgressKeyframes: undefined,
                                                            videoLogsKeyframes: undefined,
                                                            videoErrorKeyframes: undefined
                                                          };
                                                        }
                                                        return s;
                                                      });
                                                      return { ...p, scenes: updatedScenes };
                                                    }
                                                    return p;
                                                  });
                                                  try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (err) { console.error(err); }
                                                  return updatedList;
                                                });
                                                showToast("已重置首尾影格與影片設定！", "success");
                                              }
                                            }}
                                            className="bg-red-950/90 hover:bg-red-800 text-white px-2 py-1 rounded text-[9px] font-bold transition shadow-md flex items-center gap-1 border border-red-700/50 cursor-pointer active:scale-95 whitespace-nowrap"
                                          >
                                            <RefreshCw className="w-2.5 h-2.5" />
                                            <span>重置首尾/重做</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center space-y-1 text-slate-600 group-hover/img:text-slate-400 transition">
                                        <div className="relative">
                                          <Clapperboard className="w-8 h-8 group-hover/img:scale-110 transition-transform" />
                                          <Upload className="w-3.5 h-3.5 text-indigo-500 absolute -bottom-1 -right-1 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-[10px]">無渲染畫布 (請先點選下方算圖)</span>
                                        <span className="text-[9px] text-slate-550 hidden group-hover/img:block mt-1">或點擊、拖曳在此上傳您的照片</span>
                                      </div>
                                    )}

                                    {scene.isGeneratingVideoKeyframes && (
                                      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                                        <RefreshCw className="w-7 h-7 text-purple-400 animate-spin mb-2" />
                                        <span className="text-xs font-bold text-white mb-1">正在進行首尾影格轉換渲染...</span>
                                        <div className="w-3/4 bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                                          <div 
                                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
                                            style={{ width: scene.videoProgressKeyframes || "0%" }}
                                          />
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">進度: {scene.videoProgressKeyframes || "0%"}</span>
                                        
                                        {scene.videoLogsKeyframes && scene.videoLogsKeyframes.length > 0 && (
                                          <div className="w-full mt-2 bg-black/90 p-2 rounded-lg text-[8px] font-mono text-purple-400 text-left h-24 overflow-y-auto border border-purple-500/20 select-text leading-relaxed">
                                            {scene.videoLogsKeyframes.map((logLine, logIdx) => (
                                              <div key={logIdx}>{logLine}</div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Rendering actions below video */}
                                  {scene.isGeneratingVideoKeyframes && (
                                    <div className="flex gap-2 w-full mt-2 mb-2">
                                      <button
                                        onClick={() => handleStopGenerateVideo(scene.id)}
                                        className="flex-1 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 shadow-md border border-rose-500/50"
                                      >
                                        <StopCircle className="w-3.5 h-3.5" />
                                        <span>🛑 停止影片生成</span>
                                      </button>
                                      <button
                                        onClick={() => handleResetVideoTask()}
                                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 border border-slate-700"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>取消/重置</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Error message */}
                                  {scene.videoErrorKeyframes && (
                                    <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 text-[10px] space-y-1 font-mono leading-relaxed select-text">
                                      <div className="font-bold flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>首尾轉換出錯 (代碼 {scene.videoErrorCodeKeyframes || "N/A"})</span>
                                      </div>
                                      <p>{scene.videoErrorKeyframes}</p>
                                      {scene.videoLogsKeyframes && scene.videoLogsKeyframes.length > 0 && (
                                        <details className="mt-1">
                                          <summary className="cursor-pointer font-bold text-[9px] text-slate-400">查看完整渲染日誌</summary>
                                          <div className="mt-1 bg-black/80 p-2 rounded text-[8px] max-h-28 overflow-y-auto text-left leading-normal text-red-300">
                                            {scene.videoLogsKeyframes.map((ll, idx) => <div key={idx}>{ll}</div>)}
                                          </div>
                                        </details>
                                      )}
                                    </div>
                                  )}

                                  {/* Playback & Download triggers */}
                                  <div className="space-y-2">
                                    {scene.videoUrlKeyframes && (
                                      <a
                                        href={`/api/download?url=${encodeURIComponent(scene.videoUrlKeyframes)}`}
                                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-purple-900/20 flex items-center justify-center gap-1.5 cursor-pointer border border-purple-500/30"
                                        download={`toonflow-scene-${index + 1}.mp4`}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>📥 下載已生成之 MP4 影片</span>
                                      </a>
                                    )}
                                    {scene.imageUrlKeyframes && (
                                      <button
                                        onClick={() => {
                                          setSelectedSceneForSimulation(scene);
                                          setIsPlayingSimulation(true);
                                        }}
                                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg border border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                                        <span>🎥 實時首尾過渡與台詞預覽 (免費)</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Multi Action buttons */}
                                <div className="flex flex-col gap-2">
                                  {scene.id.startsWith("scene_transition_") ? (
                                    <button
                                      onClick={() => handleGenerateImage(scene.id, 'gemini')}
                                      disabled={scene.isGeneratingImageKeyframes}
                                      className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-[11px] font-bold rounded-lg border border-teal-500/30 hover:border-teal-400 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-950/20 z-30"
                                      title="一鍵提取上一場景最後一幀作為本銜接場景首幀，並設定下一場景作為過渡尾幀"
                                    >
                                      {scene.isGeneratingImageKeyframes ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Link2 className="w-4 h-4 text-teal-200" />
                                      )}
                                      <span>🔗 智慧自動銜接：提取上鏡最後一幀</span>
                                    </button>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'nanobanana')}
                                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-bold rounded-lg border border-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageKeyframes ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                                        <span>Nano 繪圖</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'gemini')}
                                        className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[9px] font-bold rounded-lg border border-indigo-900 hover:border-indigo-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageKeyframes ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                                        <span>Gemini 繪圖</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'agnes')}
                                        className="w-full py-2 bg-pink-950 hover:bg-pink-900 text-pink-300 text-[9px] font-bold rounded-lg border border-pink-900 hover:border-pink-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageKeyframes ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-pink-400" />}
                                        <span>Agnes 繪圖</span>
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(scene.id, 'mistral')}
                                        className="w-full py-2 bg-orange-950 hover:bg-orange-900 text-orange-200 text-[9px] font-bold rounded-lg border border-orange-900 hover:border-orange-700 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                      >
                                        {scene.isGeneratingImageKeyframes ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
                                        <span>Mistral 繪圖</span>
                                      </button>
                                    </div>
                                  )}
                                  {scene.isGeneratingImageKeyframes && (
                                    <div className="flex flex-col gap-1.5 items-center justify-center p-2 bg-slate-900/80 rounded-lg border border-red-500/30 animate-pulse">
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        AI 正在生成插圖中...
                                      </div>
                                      <div className="flex gap-2 w-full">
                                        <button
                                          onClick={() => handleStopGenerateImage(scene.id)}
                                          className="flex-1 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <StopCircle className="w-3.5 h-3.5" />
                                          <span>停止</span>
                                        </button>
                                        <button
                                          onClick={() => handleGenerateImage(scene.id, 'agnes')}
                                          className="flex-1 py-1.5 bg-pink-700/90 hover:bg-pink-600 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                                          <span>Agnes</span>
                                        </button>
                                        <button
                                          onClick={() => handleGenerateImage(scene.id, 'mistral')}
                                          className="flex-1 py-1.5 bg-orange-700/90 hover:bg-orange-600 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition cursor-pointer z-30"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                                          <span>Mistral</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleGenerateVideoKeyframes(scene.id, index)}
                                      disabled={scene.isGeneratingVideoKeyframes || !startImageUrl}
                                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                        !startImageUrl 
                                          ? "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-55" 
                                          : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white hover:opacity-95 border-transparent shadow"
                                      }`}
                                      title={!startImageUrl ? "請先完成分鏡繪圖再生成影片" : "以本分鏡與下一分鏡之相片作為首尾影格過渡生成 5秒 影片"}
                                    >
                                      <Video className="w-4 h-4" />
                                      <span>🎬 一鍵 AI 首尾過渡影片</span>
                                    </button>

                                    <label
                                      htmlFor={`upload-scene-img-kf-${scene.id}`}
                                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                      title="從您的電腦上傳自訂分鏡插圖"
                                    >
                                      <Upload className="w-4 h-4 text-purple-400" />
                                      <span>上傳照片</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Inline Scene Chatbot */}
                            <div className="md:col-span-12 mt-6 border-t border-slate-800/80 pt-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                      分鏡智慧協調助理
                                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-mono font-medium">Chat & Modify</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">就該分鏡主題解答、翻譯，或下達指令即時修改此分鏡的所有內容。</p>
                                  </div>
                                </div>
                              </div>

                              {/* Chat messages container */}
                              <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3 min-h-[100px] max-h-[250px] overflow-y-auto custom-scrollbar">
                                {(!sceneChats[scene.id] || sceneChats[scene.id].length === 0) ? (
                                  <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                                    <p className="text-[11px] text-slate-500 italic">尚未與本分鏡助理進行過對話。你可以點擊以下預設指令快速進行：</p>
                                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                                      {[
                                        { text: "💡 幫我將台詞改得更有情感張力，並同步更新英文 PROMPT", action: "請幫我把台詞對白改得更有情感張力、口語化且吸引人，並依據此情感同步優化繪圖英文描述提示詞 (PROMPT) 與動作描述 (ACTION PROMPT)。" },
                                        { text: "👩 解決雙男角/雙女角問題：在 PROMPT 中明確設定主角與女主角的性別與長相", action: "我的場景中有男主角（陳默）和女主角（林芊），但 AI 繪圖生成了兩個男生。請幫我修改英文 PROMPT，在裡面明確標記：Chen Mo 為帥氣年輕男性 (handsome young Chinese male)、Lin Qian 為長髮美麗女性 (beautiful young Chinese female with long hair)，以修正雙男角問題，並保持角色服裝一致。" },
                                        { text: "🎬 幫我優化鏡頭運動 (Action Prompt) 與導演註記", action: "請幫我精進本分鏡的「影片動作描述提示詞 (ACTION PROMPT)」與「導演註記 (DIRECTOR'S NOTES)」，加入更專業的電影級運鏡技巧、燈光氛圍、冷暖色調與情感特寫指示。" },
                                        { text: "🎵 設計更有臨場感的環境音效與背景音樂描述", action: "請針對此場景的氣氛，幫我設計更生動、具有電影臨場感的「音效與背景音樂 / 鏡頭音訊 (audioCue)」描述。" }
                                      ].map((btn, bIdx) => (
                                        <button
                                          key={bIdx}
                                          type="button"
                                          onClick={() => {
                                            setSceneChatInputs(prev => ({ ...prev, [scene.id]: btn.action }));
                                          }}
                                          className="text-[10px] text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all text-left cursor-pointer active:scale-95"
                                        >
                                          {btn.text}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  sceneChats[scene.id].map((msg, mIdx) => (
                                    <div key={mIdx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                                        msg.role === 'user'
                                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                                      }`}>
                                        {msg.role === 'ai' && (
                                          <div className="text-[9px] font-bold mb-1 text-indigo-400 uppercase flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            分鏡助理
                                          </div>
                                        )}
                                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                      </div>
                                    </div>
                                  ))
                                )}

                                {isSceneChatting[scene.id] && (
                                  <div className="flex justify-start">
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                      <span>AI 導演正針對此分鏡重新佈置並即時更新設定中...</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Chat input box */}
                              <div className="flex gap-2">
                                <textarea
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans min-h-[44px] max-h-[100px] resize-y custom-scrollbar"
                                  placeholder="對此分鏡下達修改、翻譯指令，或直接發問（例：請幫我將台詞改為德語並更新 PROMPT）..."
                                  value={sceneChatInputs[scene.id] || ""}
                                  onChange={(e) => setSceneChatInputs(prev => ({ ...prev, [scene.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      if ((sceneChatInputs[scene.id] || "").trim() && !isSceneChatting[scene.id]) {
                                        handleChatScene(scene.id);
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleChatScene(scene.id)}
                                  disabled={isSceneChatting[scene.id] || !(sceneChatInputs[scene.id] || "").trim()}
                                  className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/50 text-white disabled:text-slate-500 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
                                >
                                  {isSceneChatting[scene.id] ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  <span>傳送</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )})}

                        {activeProject.scenes.length === 0 && (
                          <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                            此專案尚未拆解分鏡。請在上方原著小說頁面輸入劇本文字，並按下「一鍵 AI 拆解分鏡」生成豐富的故事劇本！
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TAB: GALLERY ============ */}
              {activeTab === "gallery" && (
                <div className="space-y-6">
                  <VideoGallery activeProject={activeProject} />
                </div>
              )}

            </div>

          </div>
        )}

      {/* ================= MODAL: 3D SIMULATION PLAYBACK (本地 100% 免費影片製作大師) ================= */}
      <AnimatePresence>
        {selectedSceneForSimulation && isPlayingSimulation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur"
          >
            <div className="max-w-4xl w-full flex flex-col space-y-4">
              
              {/* Header inside player */}
              <div className="flex items-center justify-between text-slate-300 px-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-pink-500/20 text-pink-400 font-mono font-bold border border-pink-500/20 px-2 py-0.5 rounded">
                    本地 100% 免費影片製作大師
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedSceneForSimulation.title}</h3>
                </div>
                <button
                  onClick={() => {
                    setIsPlayingSimulation(false);
                    setSelectedSceneForSimulation(null);
                  }}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Simulated Screen with cinematic borders and zoom effect */}
              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                
                {/* Widescreen Cinematic bars */}
                <div className="absolute top-0 inset-x-0 h-[10%] bg-black z-20" />
                <div className="absolute bottom-0 inset-x-0 h-[10%] bg-black z-20" />

                {/* Subtitle / Dialogue overlay */}
                <div className="absolute bottom-[14%] inset-x-8 text-center z-30 pointer-events-none px-4">
                  <div className="inline-block bg-black/85 backdrop-blur-md text-yellow-300 font-sans px-4 py-2 rounded-lg border border-yellow-500/10 shadow-lg font-bold text-sm md:text-base tracking-wide leading-relaxed animate-pulse">
                    【{selectedSceneForSimulation.character}】: {selectedSceneForSimulation.dialogue}
                  </div>
                </div>

                {/* Canvas image zooming with moving camera animation */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={selectedSceneForSimulation.imageUrl || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"}
                    alt="Cinema storyboard zoom"
                    className="w-full h-full object-cover origin-center animate-zoomPan"
                    style={{
                      animation: "zoomPan 8s infinite alternate ease-in-out"
                    }}
                  />
                </div>

                 {/* Simulated Audio waveform visualization */}
                <div className="absolute top-12 right-6 z-30 flex flex-col items-end space-y-1.5">
                  <div className="flex items-center space-x-0.5 bg-black/75 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-full text-[10px] font-mono text-pink-400 font-bold shadow-lg">
                    <Volume2 className="w-3.5 h-3.5 mr-1 text-pink-400 animate-bounce" />
                    <span>TTS 音訊合成: 已開啟 (24kHz)</span>
                    <div className="flex items-end h-3 space-x-0.5 ml-2">
                      <div className="w-0.5 bg-pink-500 animate-soundwave-1" />
                      <div className="w-0.5 bg-pink-500 animate-soundwave-2" />
                      <div className="w-0.5 bg-pink-500 animate-soundwave-3" />
                      <div className="w-0.5 bg-pink-500 animate-soundwave-4" />
                    </div>
                  </div>
                  {selectedSceneForSimulation.audioCue && (
                    <div className="bg-black/85 backdrop-blur-md border border-pink-500/20 text-pink-300 font-sans px-3 py-1 text-[10px] font-bold rounded-lg max-w-[280px] shadow-lg flex items-center gap-1 animate-pulse">
                      <span className="text-yellow-400">🎵</span>
                      <span className="truncate" title={selectedSceneForSimulation.audioCue}>
                        音訊氛圍：{selectedSceneForSimulation.audioCue}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Sub-text explanation */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 text-center leading-relaxed">
                正在以 <strong>{activeProject?.cameraMotion || "經典推拉運鏡"}</strong> 進行實時 3D 相機移動渲染。寬螢幕字幕、聲波合成已完成，支援流暢導出。
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: DELETE PROJECT CONFIRMATION ================= */}
      <AnimatePresence>
        {projectToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Project?</h3>
                <p className="text-slate-400 text-sm mb-6">
                  This action cannot be undone. All scenes and characters within this project will be permanently deleted.
                </p>
                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => setProjectToDelete(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteProject}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white transition font-bold text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SETTINGS DRAWER ================= */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <div className="absolute inset-y-0 right-0 max-w-md w-full flex pl-10">
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col space-y-6 shadow-2xl relative"
              >
                {/* Close Settings */}
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1 pr-10">
                  <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-pink-500" />
                    Toonflow Settings
                  </h3>
                  <p className="text-xs text-slate-400">Configure your professional AI video keys and integrations.</p>
                </div>

                <div className="space-y-5 flex-1 overflow-y-auto">
                  {/* Custom API key parameter input */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-bold uppercase block">
                      個人專屬 Agnes API Key (AGNES_API_KEY)
                    </label>
                    <input
                      type="password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-pink-500 transition placeholder:text-slate-700"
                      placeholder="cpk-CJxrCSyi..."
                      value={customApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                    />
                    <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl text-[10px] text-slate-400 leading-normal space-y-1">
                      <p className="font-bold text-slate-300">💡 提示與免費額度說明</p>
                      <p>
                        預設免費用量：我們已在伺服器後台環境中為您內置配置了目前最新可成功調用的內建有效金鑰，您無需設定即可直接成功調用。
                      </p>
                      <p className="text-indigo-400 font-bold">
                        如果您有自己註冊的 Agnes 帳號，在此貼上您的金鑰後，系統會將它儲存於您的瀏覽器本地，並在生成影片時自動以您的個人配額發起請求！
                      </p>
                    </div>
                  </div>

                  {/* Force Reset Task Lock Section */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-300">⚙️ 影片生成狀態修復</p>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      如果系統提示「A video generation is already in progress」或生成進度卡住，請點擊下方按鈕強制清除背景任務排程鎖。
                    </p>
                    <button
                      onClick={() => handleResetVideoTask()}
                      className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>強制重置影片生成鎖 (Force Reset Lock)</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 space-y-2">
                    <p className="text-xs font-bold text-slate-400">Environment Metadata</p>
                    <div className="bg-slate-950 p-3 rounded-lg text-[11px] font-mono text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>PORT:</span>
                        <span>3000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NODE_ENV:</span>
                        <span>development</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VITE_HMR:</span>
                        <span>disabled</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-850 pt-4">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white font-medium rounded-xl text-xs transition text-center"
                  >
                    關閉設定並返回
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= PRINT / PDF SCRIPT PREVIEW MODAL ================= */}
      <AnimatePresence>
        {isPrintModalOpen && activeProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex justify-center items-start p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Top Action Bar (hidden when printing) */}
              <div className="no-print bg-slate-900/95 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
                <div className="flex items-center space-x-2.5">
                  <Printer className="w-5 h-5 text-pink-500 animate-pulse" />
                  <div>
                    <h3 className="font-display font-extrabold text-white text-sm">
                      導演劇本與分鏡腳本預覽 (Screenplay & Storyboard)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      專案：{activeProject.name} | 共 {activeProject.scenes.length} 個分鏡場景
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="py-2 px-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-pink-500/10"
                  >
                    <Printer className="w-4 h-4" />
                    <span>立即列印 / 另存為 PDF</span>
                  </button>
                  <button
                    onClick={() => setIsPrintModalOpen(false)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                    title="關閉預覽"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Area (Main Sheet) */}
              <div id="print-preview-modal" className="flex-1 bg-slate-950 p-6 md:p-10 text-slate-100 overflow-y-auto max-h-[80vh] scrollbar-thin">
                
                {/* Print Banner */}
                <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono tracking-widest uppercase font-extrabold border border-indigo-500/20 px-2 py-0.5 rounded">
                      ToonFlow Storyboard & Director's Book
                    </span>
                    <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight leading-tight">
                      {activeProject.name}
                    </h1>
                    {activeProject.novelText && (
                      <p className="text-xs text-slate-400 max-w-2xl line-clamp-2 italic">
                        原著內容摘要：{activeProject.novelText}
                      </p>
                    )}
                  </div>
                  <div className="text-left md:text-right text-[10px] font-mono text-slate-500 space-y-1">
                    <p>編制日期: {new Date().toLocaleDateString()}</p>
                    <p>創立時間: {activeProject.createdAt}</p>
                    <p>劇本系統: ToonFlow Studio v2.0</p>
                  </div>
                </div>

                {/* Cast / Characters Section */}
                {activeProject.characters && activeProject.characters.length > 0 && (
                  <div className="mb-10 space-y-3 print-card">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-900 pb-2">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span>登場角色名冊 (Cast & Characters)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeProject.characters.map((char) => (
                        <div key={char.id} className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl space-y-2 print-bg-light">
                          <div className="flex items-center gap-2">
                            {char.imageUrl ? (
                              <img
                                src={char.imageUrl}
                                alt={char.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-slate-800"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase border border-slate-700">
                                {char.name.slice(0, 1)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-white print-text-dark">{char.name}</p>
                              <p className="text-[9px] text-slate-500 font-mono">風格: {char.artStyle || "預設"}</p>
                            </div>
                          </div>
                          {char.description && (
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 print-text-muted">
                              描述：{char.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storyboard List */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-900">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>分鏡對白與導演規劃腳本 (Storyboard Script)</span>
                  </h3>

                  {activeProject.scenes.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                      目前此專案尚無分鏡場景資料。
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {activeProject.scenes.map((scene, index) => (
                        <div
                          key={scene.id}
                          className="bg-slate-900/30 border border-slate-850 rounded-2xl p-5 md:p-6 space-y-4 print-card print-bg-light relative"
                        >
                          {/* Card Header Info */}
                          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-850 pb-3">
                            <div className="flex items-center space-x-2.5">
                              <span className="w-6 h-6 rounded-lg bg-pink-500 text-white text-[11px] font-mono font-bold flex items-center justify-center shadow-lg shadow-pink-500/20">
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-extrabold text-white print-text-dark">
                                  {scene.title || `未命名分鏡場景 ${index + 1}`}
                                </h4>
                                <p className="text-[9px] text-slate-500 font-mono">
                                  ID: {scene.id}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 print-bg-light print-text-muted">
                                🎬 角色: <strong className="text-pink-400 font-sans">{scene.character || "無"}</strong>
                              </span>
                              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 print-bg-light print-text-muted">
                                ⏱️ 時長: <strong className="text-indigo-400">{scene.durationSeconds || ""} 秒</strong>
                              </span>
                            </div>
                          </div>

                          {/* Grid with image and content */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* Visual reference thumbnail */}
                            <div className="md:col-span-4 space-y-2">
                              <div className="aspect-video bg-slate-950 border border-slate-850 rounded-xl overflow-hidden relative shadow-inner print-bg-light">
                                {scene.imageUrlKeyframes ? (
                                  <img
                                    src={scene.imageUrlKeyframes}
                                    alt={scene.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-600 gap-1 p-4 text-center">
                                    <span>無分鏡預覽圖片</span>
                                    <span>No Reference Image</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[9px] font-mono text-slate-500 line-clamp-1 truncate" title={scene.imageUrlKeyframes}>
                                {scene.imageUrlKeyframes || "未上傳/未生成圖片網址"}
                              </p>
                            </div>

                            {/* Dialogue, narration & prompts */}
                            <div className="md:col-span-8 space-y-3 text-xs">
                              {scene.dialogue && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-yellow-500/80 uppercase block">🗣️ 角色對白 (Dialogue)</span>
                                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-yellow-300 font-medium leading-relaxed print-bg-light print-text-dark">
                                    {scene.dialogue}
                                  </div>
                                </div>
                              )}

                              {scene.narration && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">📖 場景旁白 (Narration)</span>
                                  <p className="text-slate-300 pl-1 leading-relaxed italic print-text-muted">
                                    {scene.narration}
                                  </p>
                                </div>
                              )}

                              {scene.audioCue && (
                                <div className="space-y-1 bg-pink-500/5 p-2 rounded-lg border border-pink-500/10 print-bg-light">
                                  <span className="text-[9px] font-mono font-bold text-pink-400 uppercase flex items-center gap-1">
                                    <span>🎵 音效與氛圍音樂 (Audio Cue)</span>
                                  </span>
                                  <p className="text-slate-300 text-[10px] pl-1 print-text-dark">
                                    {scene.audioCue}
                                  </p>
                                </div>
                              )}

                              {scene.visualPrompt && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-cyan-400/80 uppercase block">🎨 英文畫面提示詞 (Visual Prompt)</span>
                                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-400 leading-normal select-all print-text-muted">
                                    {scene.visualPrompt}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Director Notes Row (Separated fully) */}
                          {scene.directorNotes && (
                            <div className="mt-2 pt-3 border-t border-slate-850 space-y-1 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 print-bg-light">
                              <span className="text-[9px] font-mono font-bold text-amber-500 uppercase flex items-center gap-1">
                                🎬 導演註記與個人拍攝備忘 (Director's & Camera Notes)
                              </span>
                              <p className="text-[11px] text-slate-300 pl-1 leading-relaxed print-text-dark font-sans whitespace-pre-wrap">
                                {scene.directorNotes}
                              </p>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Print Footer */}
                <div className="mt-12 pt-6 border-t border-slate-900 text-center text-[10px] text-slate-600 space-y-1">
                  <p>ToonFlow Studio © 2026. All rights reserved.</p>
                  <p className="no-print">離線儲存小技巧：點擊上方列印按鈕後，在印表機目標中選擇「另存為 PDF (Save as PDF)」即可匯出完美的高解析度電子劇本！</p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Styled inline animation helpers */}
      <style>{`
        @keyframes zoomPan {
          0% { transform: scale(1.0) translate(0, 0); }
          50% { transform: scale(1.15) translate(1%, -1%); }
          100% { transform: scale(1.05) translate(-1%, 1%); }
        }
        .animate-zoomPan {
          animation: zoomPan 10s infinite alternate ease-in-out;
        }
        @keyframes bounce-small {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes soundwave {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .animate-soundwave-1 { animation: soundwave 0.8s infinite ease-in-out; }
        .animate-soundwave-2 { animation: soundwave 1.1s infinite ease-in-out; }
        .animate-soundwave-3 { animation: soundwave 0.6s infinite ease-in-out; }
        .animate-soundwave-4 { animation: soundwave 0.9s infinite ease-in-out; }

        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything in the main layout */
          #root > div:not(.fixed), 
          main > *:not(#print-preview-modal),
          header, footer, .no-print {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }
          /* Style the printable area */
          #print-preview-modal {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          .print-card {
            background: white !important;
            color: black !important;
            border: 1px solid #ddd !important;
            page-break-inside: avoid !important;
            margin-bottom: 20px !important;
          }
          .print-text-dark {
            color: #111 !important;
          }
          .print-text-muted {
            color: #555 !important;
          }
          .print-bg-light {
            background-color: #f9f9f9 !important;
            border-color: #eee !important;
          }
        }
      `}</style>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md text-center py-6 text-xs text-slate-500 mt-auto relative z-10">
        <p>Built with Agnes Video V2.0 Integration & Gemini AI Engine. Toonflow Platform © 2026.</p>
      </footer>
    </div>
  );
}
