const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The injected code by mistake was:
const wrongInjectedCode = `                      {/* Scene Cards Loop */}
                      <div className="space-y-6">
                        {activeProject.scenes.map((scene, index) => {
                          const matchingChar = activeProject.characters.find(c => (c.name || "").trim().toLowerCase() === (scene.character || "").trim().toLowerCase());
                          return (
                            <div key={scene.id} className="space-y-2">
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
                                handleGenerateVideo={handleGenerateVideo}
                                handleGenerateImage={handleGenerateImage}
                                scenes={activeProject.scenes}
                                activeProjectId={activeProject.id}
                                setProjects={setProjects}
                                showToast={showToast}
                                isFullAutoProducing={isFullAutoProducing}
                                fullAutoProgress={fullAutoProgress}
                                fullAutoLogs={fullAutoLogs}
                                onFullAutoProduce={handleFullAutoVideoProduction}
                                sceneType="keyframes"
                              />
                            </div>
                          );
                        })}
                      </div>`;

// We replace the wrongly injected code with the standard scenes loop:
const correctScenesLoop = `                      {/* Scene Cards Loop */}
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
                                handleGenerateVideo={handleGenerateVideo}
                                handleGenerateImage={handleGenerateImage}
                                scenes={activeProject.scenes}
                                activeProjectId={activeProject.id}
                                setProjects={setProjects}
                                showToast={showToast}
                                isFullAutoProducing={isFullAutoProducing}
                                fullAutoProgress={fullAutoProgress}
                                fullAutoLogs={fullAutoLogs}
                                onFullAutoProduce={handleFullAutoVideoProduction}
                                sceneType="standard"
                              />
                            </div>
                          );
                        })}
                      </div>`;

code = code.replace(wrongInjectedCode, correctScenesLoop);

// Also remove the extra trailing braces in the activeTab === "scenes" block
const extraBraces = `                        );
                      })}
                        {activeProject.scenes.length === 0 && (`;
code = code.replace(extraBraces, `                        {activeProject.scenes.length === 0 && (`);


fs.writeFileSync('src/App.tsx', code);
