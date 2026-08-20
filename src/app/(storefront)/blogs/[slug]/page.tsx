import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPublicBlogBySlug, getPublicBlogs } from '@/lib/actions/blogs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  try {
    const blog = await getPublicBlogBySlug(decodedSlug);
    return {
      title: blog.title,
      description: blog.summary,
      alternates: {
        canonical: `/blogs/${slug}`,
      },
      openGraph: {
        title: blog.title,
        description: blog.summary,
        images: blog.cover_image_url ? [blog.cover_image_url] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.summary,
        images: blog.cover_image_url ? [blog.cover_image_url] : [],
      },
    };
  } catch (e) {
    return {
      title: 'Blog Not Found',
    };
  }
}

export async function generateStaticParams() {
  try {
    const blogs = await getPublicBlogs();
    return blogs.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (e) {
    return [];
  }
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  let blog;

  try {
    blog = await getPublicBlogBySlug(decodedSlug);
  } catch (e) {
    notFound();
  }

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.summary,
    "image": blog.cover_image_url || undefined,
    "datePublished": blog.created_at,
    "author": {
      "@type": "Organization",
      "name": blog.author || "R Creation"
    },
    "publisher": {
      "@type": "Organization",
      "name": "R Creation",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rcreationframes.com/logo.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rcreationframes.com/blogs/${slug}`
    }
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
        "name": "Blog",
        "item": "https://rcreationframes.com/blogs"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title
      }
    ]
  };

  return (
      <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
      <article className="bg-[#fcfcfc] min-h-screen pt-6 md:pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link href="/blogs" className="inline-flex items-center text-sm text-[#595959] hover:text-[#0a0e27] mb-8 transition-colors animate-fade-in">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all blogs
          </Link>

          <header className="mb-10 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-[#0a0e27] mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-[#595959] text-sm gap-4 pb-8 border-b border-[#eaeaea]">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1.5" />
                {blog.author}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" />
                {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </header>

          {blog.cover_image_url && (
            <div className="mb-12 rounded-xl overflow-hidden shadow-sm animate-fade-in relative aspect-[16/9]">
              <Image 
                src={blog.cover_image_url} 
                alt={blog.title} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg prose-slate max-w-none animate-fade-in prose-headings:text-[#0a0e27] prose-a:text-[#2aabb0] hover:prose-a:text-[#1e858a]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </div>

        </div>
      </article>
      </>
  );
}
