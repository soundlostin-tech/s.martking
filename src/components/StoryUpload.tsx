"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Camera } from "lucide-react";
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

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
  };

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
    if (!file || !user) {
      toast.error("Please select a file and sign in");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: dbError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: file.type.startsWith('video') ? 'video' : 'image',
          caption: caption.trim() || null,
          expires_at: expiresAt.toISOString()
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      toast.success("Story posted! It will be visible for 24 hours.");
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error uploading story:", error);
      toast.error(error.message || "Failed to upload story");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E5E7EB]"
        >
          <div className="p-8 border-b border-[#F5F5F5] flex items-center justify-between bg-[#F5F5F5]/50">
            <div>
              <h3 className="text-2xl font-heading text-[#1A1A1A]">New Story</h3>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mt-1">Visible for 24 hours</p>
            </div>
            <button 
              onClick={handleClose} 
              disabled={uploading}
              className="p-3 hover:bg-[#1A1A1A]/5 rounded-2xl transition-all text-[#6B7280] disabled:opacity-50"
            >
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
                <div className="border-2 border-dashed border-[#5FD3BC]/30 rounded-[32px] p-12 flex flex-col items-center justify-center gap-6 group-hover:border-[#5FD3BC] transition-all duration-500 bg-[#5FD3BC]/5">
                  <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm text-[#5FD3BC] group-hover:scale-110 transition-transform duration-500">
                    <Camera size={32} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-lg text-[#1A1A1A]">Tap to Upload</p>
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
                      playsInline
                    />
                  ) : (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover block" 
                    />
                  )}
                  <button 
                    onClick={resetForm}
                    disabled={uploading}
                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md text-[#1A1A1A]/60 rounded-2xl hover:bg-white hover:text-[#EF4444] transition-all z-10 shadow-xl disabled:opacity-50"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] ml-1">Caption (optional)</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    maxLength={200}
                    className="w-full px-6 py-5 rounded-[24px] bg-[#F5F5F5] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#5FD3BC]/20 focus:bg-white transition-all resize-none h-24 text-[#1A1A1A] text-base"
                  />
                  <p className="text-right text-[10px] text-[#9CA3AF]">{caption.length}/200</p>
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
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Post Story
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
