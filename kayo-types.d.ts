export type KayoProfile = {
    name: String,
    id: String    
};

export type KayoManifest = {
    uri: string;
}

export type KayoStream = {
    manifest: KayoManifest;
}

export type KayoEventData = {
    recommendedStream: KayoStream;
}