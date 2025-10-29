import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-black">
              Medium
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signin" className="text-gray-700 hover:text-black font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-semibold">
                  ✨ AI-Powered Writing Platform
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight text-black">
                Where great
                <span className="text-gray-700"> stories</span> come to life
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Write, share, and discover amazing content with AI assistance. Join a community of writers and readers who are shaping the future of storytelling.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="px-8 py-4 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 text-center">
                  Start Writing
                </Link>
                <Link to="/blogs" className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-full font-semibold text-lg hover:border-black hover:bg-gray-50 transition-all duration-200 text-center">
                  Explore Stories
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Stories Published</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">5K+</div>
                  <div className="text-sm text-gray-600">Active Writers</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Monthly Readers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-2 bg-gray-100 rounded w-16 mt-2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <div className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-xs font-medium">AI-Enhanced</div>
                    <div className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-medium">Featured</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-gray-100 rounded-2xl -z-10"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gray-200 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Powerful Features for
              <span className="text-gray-700"> Modern Writers</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to write, publish, and grow your audience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-xl bg-white border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">AI Writing Assistant</h3>
              <p className="text-gray-600 leading-relaxed">
                Get intelligent suggestions, grammar checks, and content improvements powered by advanced AI technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-xl bg-white border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Rich Text Editor</h3>
              <p className="text-gray-600 leading-relaxed">
                Create beautiful stories with our WYSIWYG and Markdown editors. Add images, code blocks, and more.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-xl bg-white border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Engage & Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Like, comment, save posts, and follow your favorite writers. Build meaningful connections.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-xl bg-white border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Smart Comments</h3>
              <p className="text-gray-600 leading-relaxed">
                Foster discussions with threaded comments and replies. Create a vibrant community around your content.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-xl bg-white border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Save for Later</h3>
              <p className="text-gray-600 leading-relaxed">
                Bookmark interesting articles and create your personal reading list for easy access anytime.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-xl bg-white border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">AI Summaries</h3>
              <p className="text-gray-600 leading-relaxed">
                Quickly grasp the essence of any article with AI-generated summaries and key takeaways.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Start Writing in
              <span className="text-gray-700"> Three Simple Steps</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">Sign Up</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create your free account in seconds. No credit card required. Start your writing journey today.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300"></div>
            </div>

            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">Write & Create</h3>
                <p className="text-gray-600 leading-relaxed">
                  Use our powerful editor with AI assistance to craft compelling stories. Get suggestions as you write.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300"></div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Share & Grow</h3>
              <p className="text-gray-600 leading-relaxed">
                Publish your work and reach thousands of readers. Build your audience and connect with other writers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Loved by
              <span className="text-gray-700"> Writers Worldwide</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The AI writing assistant is a game-changer! It helps me refine my ideas and improve my writing style. Absolutely love this platform."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                <div>
                  <div className="font-semibold text-black">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Tech Blogger</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Best platform for sharing my stories. The community is amazing and the editor is so intuitive. I've grown my audience 10x in just 3 months!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                <div>
                  <div className="font-semibold text-black">Michael Chen</div>
                  <div className="text-sm text-gray-500">Creative Writer</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The engagement features like comments and likes make writing so much more rewarding. I love interacting with my readers here!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div>
                  <div className="font-semibold text-black">Emily Rodriguez</div>
                  <div className="text-sm text-gray-500">Lifestyle Blogger</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of writers who are already creating amazing content with AI assistance. Start your journey today—it's completely free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200">
              Start Writing for Free
            </Link>
            <Link to="/blogs" className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all duration-200">
              Read Stories
            </Link>
          </div>
          <p className="text-gray-400 mt-6 text-sm">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-xl">M</span>
                </div>
                <span className="text-xl font-bold text-white">Medium</span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering writers with AI-powered tools to create and share amazing stories.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/blogs" className="hover:text-white transition-colors">Explore Stories</Link></li>
                <li><Link to="/publish" className="hover:text-white transition-colors">Write</Link></li>
                <li><Link to="/demo-ai" className="hover:text-white transition-colors">AI Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 Medium. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
