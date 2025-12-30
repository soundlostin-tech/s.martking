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
        className="fixed inset-0 z-[110] bg-primary/20 flex items-center justify-center p-4 backdrop-blur-md"
      >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E5E7EB]"
          >
            <div className="p-8 border-b border-[#F5F5F5] flex items-center justify-between bg-[#F5F5F5]/50">
              <div>
                <h3 className="text-2xl font-heading text-[#1A1A1A]">New Story</h3>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mt-1">Deploy Content to Arena</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-[#1A1A1A]/5 rounded-2xl transition-all text-[#6B7280]">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {!preview ? (
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-[#5FD3BC]/20 rounded-[32px] p-12 flex flex-col items-center justify-center gap-6 group-hover:border-[#5FD3BC]/50 transition-all duration-500 bg-[#5FD3BC]/5">
                    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm text-[#5FD3BC] group-hover:scale-110 transition-transform duration-500">
                      <Camera size={32} strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="font-heading text-lg text-[#1A1A1A]">Initialize Upload</p>
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-1">Image or Video (max 10MB)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative rounded-[32px] overflow-hidden bg-[#F5F5F5] border border-[#E5E7EB] aspect-square flex items-center justify-center shadow-inner">
                    {file?.type.startsWith('video') ? (
                      <video 
                        src={preview} 
                        className="w-full h-full object-cover block" 
                        autoPlay 
                        muted 
                        loop 
                      />
                    ) : (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover block" 
                      />
                    )}
                    <button 
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md text-[#1A1A1A]/60 rounded-2xl hover:bg-white hover:text-[#5FD3BC] transition-all z-10 shadow-xl"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] ml-1">Content Caption</label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Describe your achievement..."
                      className="w-full px-6 py-5 rounded-[24px] bg-[#F5F5F5] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#5FD3BC]/20 focus:bg-white transition-all resize-none h-28 text-[#1A1A1A] font-serif italic text-lg"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-5 bg-[#1A1A1A] text-white rounded-[24px] font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2A2A2A] transition-all shadow-xl shadow-[#1A1A1A]/20 active:scale-[0.98]"
              >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  STABILIZING LINK...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  DEPLOY STORY
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
