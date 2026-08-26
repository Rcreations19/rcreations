import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicBlogs } from '@/lib/actions/blogs';
import { ArrowRight, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Blog',
  description: 'Read the latest updates, tips, and insights on custom framing, corporate gifting, and more from R Creation.',
  alternates: {
    canonical: '/blogs',
  },
};

const blogListSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "R Creation Blog",
  "description": "Read the latest updates, tips, and insights on custom framing, corporate gifting, and more from R Creation.",
  "url": "https://rcreationframes.com/blogs"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://rcreationframes.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog"
    }
  ]
};

export default async function BlogsPage() {
  const blogs = await getPublicBlogs().catch(() => []);

  return (
      <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
      <div className="bg-surface min-h-screen pt-8 md:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#595959] animate-fade-in">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-primary font-medium">Blog</li>
            </ol>
          </nav>

          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Our Blog</h1>
            <p className="text-[#595959] max-w-2xl mx-auto text-lg">
              Insights, tips, and updates from the world of custom framing and corporate gifting.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 text-[#595959] bg-white rounded-xl shadow-sm border border-border">
              <p className="text-lg">No blogs published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, idx) => (
                <Link href={`/blogs/${blog.slug}`} key={blog.id} className={`group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border overflow-hidden animate-fade-in`} style={{ animationDelay: `${idx * 100}ms` }}>
                  {blog.cover_image_url ? (
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <Image 
                        src={blog.cover_image_url} 
                        alt={blog.title} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gradient-to-br from-secondary to-[#2aabb0] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-3xl font-serif-heading opacity-50 block px-4 text-center">{blog.title}</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center text-xs text-[#595959] mb-3">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-[#595959] text-sm mb-4 line-clamp-3">
                      {blog.summary}
                    </p>
                    <div className="flex items-center text-accent text-sm font-medium">
                      Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      </>
  );
}
