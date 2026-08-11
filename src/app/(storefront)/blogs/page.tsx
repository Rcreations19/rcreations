import React from 'react';
import Link from 'next/link';
import { getPublicBlogs } from '@/lib/actions/blogs';
import { ArrowRight, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Blog | R Creation',
  description: 'Read the latest updates, tips, and insights on custom framing, corporate gifting, and more from R Creation.',
};

export default async function BlogsPage() {
  const blogs = await getPublicBlogs();

  return (
      <div className="bg-[#fcfcfc] min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0a0e27] mb-4">Our Blog</h1>
            <p className="text-[#595959] max-w-2xl mx-auto text-lg">
              Insights, tips, and updates from the world of custom framing and corporate gifting.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 text-[#595959] bg-white rounded-xl shadow-sm border border-[#eaeaea]">
              <p className="text-lg">No blogs published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, idx) => (
                <Link href={`/blogs/${blog.slug}`} key={blog.id} className={`group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#eaeaea] overflow-hidden animate-fade-in`} style={{ animationDelay: `${idx * 100}ms` }}>
                  {blog.cover_image_url ? (
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img 
                        src={blog.cover_image_url} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#10164A] to-[#2aabb0] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-3xl font-serif-heading opacity-50 block px-4 text-center">{blog.title}</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center text-xs text-[#595959] mb-3">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h2 className="text-xl font-bold text-[#0a0e27] mb-2 group-hover:text-[#2aabb0] transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-[#595959] text-sm mb-4 line-clamp-3">
                      {blog.summary}
                    </p>
                    <div className="flex items-center text-[#2aabb0] text-sm font-medium">
                      Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
