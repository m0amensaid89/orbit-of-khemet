sed -i 's/let modelId = classification.model_id;/const modelId = classification.model_id;/g' src/app/api/autopilot/route.ts
sed -i 's/m: any/m: { role: string; content: string }/g' src/app/api/autopilot/route.ts
