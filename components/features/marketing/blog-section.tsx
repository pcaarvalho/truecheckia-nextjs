'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, User, Clock, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const BlogSection = () => {
  const [hoveredPost, setHoveredPost] = useState<number | null>(null)

  const featuredPosts = [
    {
      id: 1,
      title: "The Evolution of AI Detection: What's Next in 2024",
      excerpt: "Exploring the latest advances in AI content detection technology and what the future holds for identifying machine-generated content.",
      author: "Sarah Chen",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Technology",
      image: "/api/placeholder/400/240",
      featured: true
    },
    {
      id: 2,
      title: "How to Protect Your Content Strategy from AI Misuse",
      excerpt: "Practical strategies for content creators and marketers to maintain authenticity in the age of AI-generated content.",
      author: "Marcus Rodriguez",
      date: "2024-01-12",
      readTime: "7 min read",
      category: "Strategy",
      image: "/api/placeholder/400/240"
    },
    {
      id: 3,
      title: "Academic Integrity in the AI Era: A Complete Guide",
      excerpt: "Universities and educators are adapting to AI tools. Here's how to maintain academic standards while embracing innovation.",
      author: "Dr. Emily Watson",
      date: "2024-01-10",
      readTime: "8 min read",
      category: "Education",
      image: "/api/placeholder/400/240"
    },
    {
      id: 4,
      title: "API Integration Guide: Adding AI Detection to Your App",
      excerpt: "Step-by-step tutorial for developers on integrating TrueCheckIA's API into web and mobile applications.",
      author: "Alex Kumar",
      date: "2024-01-08",
      readTime: "12 min read",
      category: "Development",
      image: "/api/placeholder/400/240"
    }
  ]

  const categories = ["All", "Technology", "Strategy", "Education", "Development", "Research"]

  return (
    <section id="blog" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/20 dark:from-indigo-900/10 dark:to-purple-900/10" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Latest{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Insights
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay ahead with expert insights on AI detection, content authenticity, and industry trends.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {categories.map((category, index) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                index === 0 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground border border-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative h-64 lg:h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-75">Featured Article Image</p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                  <span className="text-sm text-muted-foreground">{featuredPosts[0].category}</span>
                </div>
                
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                  {featuredPosts[0].title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredPosts[0].excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{featuredPosts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredPosts[0].date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPosts[0].readTime}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="group">
                    <span>Read More</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredPosts.slice(1).map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
              className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <p className="text-xs opacity-75">Article Image</p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold mb-3 leading-tight line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 inline-block">
            <h3 className="text-xl font-semibold mb-4">
              Want to stay updated with the latest in AI detection?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Subscribe to our newsletter for weekly insights, updates, and exclusive content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button>
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16 pt-16 border-t border-border/30"
        >
          {[
            { value: "50+", label: "Articles Published" },
            { value: "25k+", label: "Monthly Readers" },
            { value: "15+", label: "Expert Authors" },
            { value: "Weekly", label: "New Content" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default BlogSection