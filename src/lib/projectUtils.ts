import { Project } from "../types";

export function getProjectSignature(project: Project | null): string {
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

export function normalizeProjectsList(parsed: any[]): Project[] {
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

export function copyTextToClipboard(
  text: string,
  sceneId: string,
  setCopiedSceneId: (id: string | null) => void
): Promise<void> {
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

  return doCopy()
    .then(() => {
      setCopiedSceneId(sceneId);
      setTimeout(() => setCopiedSceneId(null), 2000);
    })
    .catch((err) => {
      console.error("Copy failed", err);
    });
}
