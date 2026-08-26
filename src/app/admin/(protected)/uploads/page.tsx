import React from 'react';
import { getCustomerUploads } from '@/lib/actions/admin-uploads';
import { Image as ImageIcon, Download, ExternalLink, Calendar, HardDrive } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminUploadsPage() {
  const uploads = await getCustomerUploads();

  // Helper function to format file size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Customer Uploads</h1>
          <p className="text-sm text-[#595959] mt-1">View and manage photos uploaded by customers for custom orders.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left admin-table-striped">
            <thead className="text-xs text-[#595959] uppercase bg-surface-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Preview</th>
                <th className="px-6 py-4 font-bold tracking-wider">File Details</th>
                <th className="px-6 py-4 font-bold tracking-wider">Date Uploaded</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {uploads?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#595959]">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-border mb-3" />
                      <p>No customer uploads found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                uploads?.map((upload) => (
                  <tr key={upload.id} className="hover:bg-surface-muted transition-colors">
                    <td className="px-6 py-4">
                      {upload.signedUrl ? (
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-border bg-surface flex items-center justify-center relative group">
                          {/* We use an img tag instead of next/image since URLs are dynamic signed URLs and might expire */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={upload.signedUrl} 
                            alt={upload.original_filename}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-md border border-border bg-surface flex items-center justify-center text-[#595959]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary line-clamp-1 max-w-[200px]" title={upload.original_filename}>
                        {upload.original_filename}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#595959]">
                        <span className="flex items-center gap-1 bg-surface-muted px-1.5 py-0.5 rounded font-mono">
                          <HardDrive className="w-3 h-3" /> {formatBytes(upload.file_size_bytes)}
                        </span>
                        <span className="uppercase text-[10px] font-bold tracking-wider">
                          {upload.mime_type.split('/')[1] || upload.mime_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#595959]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(upload.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="text-xs mt-1 font-mono text-[#888888]">ID: {upload.user_id ? upload.user_id.slice(0,8) : 'GUEST'}...</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {upload.signedUrl ? (
                        <div className="flex items-center justify-end gap-3">
                          <a 
                            href={upload.signedUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-primary hover:bg-surface-muted hover:text-accent transition-colors"
                            title="View Full Image"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <a 
                            href={upload.signedUrl} 
                            download={upload.original_filename}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-red-500 font-bold">File Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
