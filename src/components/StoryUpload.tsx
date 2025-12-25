"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface StoryUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StoryUpload({ isOpen, onClose, onSuccess }: StoryUploadProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: file.type.startsWith('video') ? 'video' : 'image',
          caption: caption.trim() || null,
        });

      if (dbError) throw dbError;

      toast.success("Story posted successfully!");
      onSuccess();
      onClose();
      setFile(null);
      setPreview(null);
      setCaption("");
    } catch (error: any) {
      console.error("Error uploading story:", error);
      toast.error(error.message || "Failed to upload story");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-xl font-heading text-black">New Story</h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {!preview ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-black/20 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center">
                    <Camera size={32} className="text-zinc-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-black">Click to upload</p>
                    <p className="text-sm text-zinc-400">Image or Video (max 10MB)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden bg-zinc-100 flex items-center justify-center">
                  {file?.type.startsWith('video') ? (
                    <video 
                      src={preview} 
                      className="w-full h-auto max-h-[500px] object-contain block" 
                      autoPlay 
                      muted 
                      loop 
                    />
                  ) : (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-auto max-h-[500px] object-contain block" 
                    />
                  )}
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Caption</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none h-24"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  POSTING...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  POST STORY
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
