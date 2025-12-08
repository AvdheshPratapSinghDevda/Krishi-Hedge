'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Shield, 
  Calculator, 
  Users, 
  Play, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Clock,
  Award,
  MapPin,
  DollarSign,
  AlertTriangle,
  BookOpen,
  Video,
  Download,
  Phone
} from 'lucide-react';

// Types
interface Module {
  id: number;
  title: string;
  duration: string;
  level: number;
  topics: string[];
  completed: boolean;
}

interface FarmerStory {
  name: string;
  farm: string;
  location: string;
  year: number;
  situation: string;
  strategy: string;
  results: string;
  savings: string;
  quote: string;
  image: string;
}

interface VideoLesson {
  id: number;
  title: string;
  duration: string;
  series: string;
  thumbnail: string;
}

export default function LearnHedgingPage() {
  const [farmerCount, setFarmerCount] = useState(12000);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animate farmer count
  useEffect(() => {
    const interval = setInterval(() => {
      setFarmerCount(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const modules: Module[] = [
    {
      id: 1,
      title: "Hedging Basics",
      duration: "20 min",
      level: 1,
      topics: ["What is hedging in plain English", "How farmers use futures", "Your first hedge step-by-step"],
      completed: false
    },
    {
      id: 2,
      title: "Know Your Markets",
      duration: "30 min",
      level: 2,
      topics: ["What moves oilseed prices", "When to watch prices", "Reading crop reports"],
      completed: false
    },
    {
      id: 3,
      title: "Build Your Strategy",
      duration: "45 min",
      level: 3,
      topics: ["How much to hedge", "Best timing", "Understanding basis"],
      completed: false
    },
    {
      id: 4,
      title: "Using Options",
      duration: "30 min",
      level: 3,
      topics: ["Put options explained", "When options beat futures", "Cost vs protection"],
      completed: false
    },
    {
      id: 5,
      title: "Managing Positions",
      duration: "30 min",
      level: 3,
      topics: ["Tracking hedges", "When to exit", "Working with brokers"],
      completed: false
    },
    {
      id: 6,
      title: "Advanced Tactics",
      duration: "45 min",
      level: 4,
      topics: ["Multiple deliveries", "Pre-harvest marketing", "Combining strategies"],
      completed: false
    }
  ];

  const farmerStories: FarmerStory[] = [
    {
      name: "Rajesh Kumar",
      farm: "1,200 acres soybeans",
      location: "Punjab",
      year: 2023,
      situation: "Planted in May with ₹14,000 soybeans. Beautiful. By July, talking ₹12,000. I was sweating.",
      strategy: "I hedged 400 acres (33%) at ₹13,750 in June. Cost me ₹2,50,000 in margin money.",
      results: "Harvest came, cash price was ₹11,900. I was sick... until I closed my hedge.",
      savings: "₹61,50,000",
      quote: "Start small. I was scared at first. Now I hedge 40% every year. It's like insurance I actually use.",
      image: ""
    },
    {
      name: "Priya Sharma",
      farm: "800 acres canola",
      location: "Haryana",
      year: 2023,
      situation: "Prices always seem to drop right before I harvest",
      strategy: "Hedged in stages: 20% in March at ₹2,400/cwt, 25% in June at ₹2,500/cwt, kept 55% flexible",
      results: "Harvest price was ₹2,150. My staged hedging averaged ₹2,269/cwt",
      savings: "₹25,50,000",
      quote: "Don't try to be perfect. You'll never sell at the absolute top. Lock in profits along the way.",
      image: ""
    },
    {
      name: "Amit Patel",
      farm: "2,000 acres corn & soybeans",
      location: "Maharashtra",
      year: 2018,
      situation: "December corn was ₹395 in spring. I thought, 'It'll go higher.' I didn't hedge.",
      strategy: "No hedge - waited for higher prices",
      results: "By fall? ₹345. Lost ₹83,50,000 I could have protected.",
      savings: "-₹83,50,000",
      quote: "Now I ALWAYS hedge something. Even if it's just 20%. Hedging isn't about being right. It's about staying in business.",
      image: ""
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-emerald-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="max-w-md mx-auto px-4 py-6 relative z-10">
          <div className="grid grid-cols-1 gap-4 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm">
                Smart Farming
              </div>
              
              <h1 className="text-xl md:text-3xl font-bold mb-3 leading-tight">
                Hedge Like a Pro Farmer
                <span className="block text-green-200 text-lg md:text-2xl">Lock in Profitable Prices</span>
              </h1>
              
              <p className="text-sm md:text-base text-green-100 mb-2">
                Stop Worrying About Price Drops. Learn How Top Producers Protect Their Income.
              </p>
              
              <p className="text-xs md:text-sm text-green-200 mb-4">
                No finance degree needed. Simple strategies that work for farms of any size.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-base font-bold">{farmerCount.toLocaleString()}</div>
                  <div className="text-[9px] text-green-200">Farmers Learned</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-base font-bold">₹1,500/acre</div>
                  <div className="text-[9px] text-green-200">Average Savings</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-2">
                <Link href="/learn-hedging/module-1" className="flex-1 bg-white text-green-600 px-3 py-2 rounded-lg font-semibold text-xs hover:bg-green-50 transition-all shadow-md flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Start Learning
                </Link>
                <button className="flex-1 bg-green-800/50 backdrop-blur-sm border border-white/30 text-white px-3 py-2 rounded-lg font-semibold text-xs hover:bg-green-800/70 transition-all flex items-center justify-center gap-1">
                  <Play className="w-3 h-3" />
                  Watch
                </button>
              </div>
            </div>

            {/* Right Visual - Compact */}
            <div className="relative hidden md:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                    <span className="text-white text-sm md:text-base">Protect income before planting</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                    <span className="text-white text-sm md:text-base">Sleep better during price drops</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                    <span className="text-white text-sm md:text-base">Budget with confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Farmers Hedge Section */}
      <section className="py-6 bg-white">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-base md:text-2xl font-bold text-gray-900 mb-1">Why Farmers Hedge</h2>
            <p className="text-xs md:text-base text-gray-600">Real scenarios. Real protection. Real peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-200">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Remember 2018?</h3>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-1">↓</span>
                  <span>Soybean prices dropped ₹200/bushel in 3 months</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-1"></span>
                  <span><strong>Farmers who hedged:</strong> Kept their budgeted price</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-1">✗</span>
                  <span><strong>Farmers who didn't:</strong> Lost ₹83,50,000+ on 1,000 acres</span>
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Plant with Confidence</h3>
              <div className="space-y-1 text-gray-700 text-xs">
                <p className="flex items-start gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Lock in prices <strong>BEFORE</strong> planting</span>
                </p>
                <p className="flex items-start gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Cover input costs + expenses</span>
                </p>
                <p className="flex items-start gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Downside protection</span>
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Like Crop Insurance, for Prices</h3>
              <div className="bg-white rounded-lg p-2 mb-2">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1"></th>
                      <th className="text-center py-1">Crop Ins.</th>
                      <th className="text-center py-1">Hedge</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b">
                      <td className="py-1">Protects</td>
                      <td className="text-center">Yield</td>
                      <td className="text-center">Price</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1">Cost</td>
                      <td className="text-center">Premium</td>
                      <td className="text-center">Margin</td>
                    </tr>
                    <tr>
                      <td className="py-1">When</td>
                      <td className="text-center">Crop fail</td>
                      <td className="text-center">Price drop</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-600 italic">Protection floor keeps you profitable</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-1">Your Hedging Journey</h2>
            <p className="text-xs text-gray-600">Start simple. Build confidence. Protect your farm.</p>
            <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-[10px]">
              <Clock className="w-3 h-3" />
              <span className="font-semibold">3 hours total</span>
            </div>
          </div>

          <div className="space-y-3">
            {modules.map((module, index) => (
              <div key={module.id} className="relative">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-3 border border-gray-100 hover:border-green-300">
                  <div className="flex items-start gap-3">
                    {/* Level Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        module.level === 1 ? 'bg-green-100 text-green-600' :
                        module.level === 2 ? 'bg-blue-100 text-blue-600' :
                        module.level === 3 ? 'bg-orange-100 text-orange-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {module.level}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{module.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {module.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {module.topics.length} topics
                            </span>
                          </div>
                        </div>
                        <Link 
                          href={`/learn-hedging/module-${module.id}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                        >
                          Start Learning
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>

                      {/* Topics */}
                      <div className="space-y-2">
                        {module.topics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farmer Stories Section */}
      <section className="py-6 bg-white">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-1">Real Farmer Stories</h2>
            <p className="text-xs text-gray-600">Learn from producers like you</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {farmerStories.map((story, index) => (
              <div key={index} className={`rounded-lg overflow-hidden shadow-md border-2 ${
                story.savings.includes('-') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
              }`}>
                {/* Header */}
                <div className={`p-3 ${ story.savings.includes('-') ? 'bg-red-100' : 'bg-green-100'}`}>
                  <div className="text-2xl mb-1 text-center">{story.image}</div>
                  <h3 className="text-sm font-bold text-gray-900 text-center">{story.name}</h3>
                  <p className="text-gray-700 text-center text-xs">{story.farm}</p>
                  <div className="flex items-center justify-center gap-1 mt-1 text-gray-600 text-[10px]">
                    <MapPin className="w-2 h-2" />
                    <span>{story.location}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 bg-white">
                  <div className="mb-2">
                    <h4 className="font-bold text-gray-900 mb-1 text-xs">The Situation:</h4>
                    <p className="text-gray-700 italic text-[10px]">"{story.situation}"</p>
                  </div>

                  <div className="mb-2">
                    <h4 className="font-bold text-gray-900 mb-1 text-xs">What They Did:</h4>
                    <p className="text-gray-700 text-[10px]">{story.strategy}</p>
                  </div>

                  <div className="mb-2">
                    <h4 className="font-bold text-gray-900 mb-1 text-xs">The Results:</h4>
                    <p className="text-gray-700 text-[10px]">{story.results}</p>
                  </div>

                  {/* Savings Box */}
                  <div className={`p-2 rounded-lg mb-2 ${
                    story.savings.includes('-') ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'
                  }`}>
                    <div className="text-center">
                      <div className="text-[10px] font-semibold text-gray-700 mb-0.5">
                        {story.savings.includes('-') ? 'Loss' : 'Savings'}
                      </div>
                      <div className={`text-lg font-bold ${story.savings.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                        {story.savings}
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="border-l-2 border-green-500 pl-2 py-1 bg-gray-50 rounded">
                    <p className="text-gray-700 italic text-[10px]">"{story.quote}"</p>
                    <p className="text-gray-500 text-[9px] mt-1">- {story.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className="py-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-base font-bold mb-1">Farm Calculator Tools</h2>
            <p className="text-xs text-green-100">Get instant insights for YOUR farm</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Break-Even Calculator */}
            <Link href="/learn-hedging/calculators/break-even" className="bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all group">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-5 h-5 text-green-300" />
                <h3 className="text-sm font-bold">Break-Even Calculator</h3>
              </div>
              <p className="text-green-100 text-xs mb-1">Calculate cost per bushel</p>
              <div className="flex items-center gap-1 text-green-300 group-hover:gap-2 transition-all text-xs">
                <span className="font-semibold">Try it</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* Hedge Planning */}
            <Link href="/learn-hedging/calculators/hedge-planning" className="bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all group">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-green-300" />
                <h3 className="text-sm font-bold">Hedge Planning</h3>
              </div>
              <p className="text-green-100 text-xs mb-1">Plan your strategy</p>
              <div className="flex items-center gap-1 text-green-300 group-hover:gap-2 transition-all text-xs">
                <span className="font-semibold">Build plan</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* Decision Helper */}
            <Link href="/learn-hedging/calculators/decision-helper" className="bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all group">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-green-300" />
                <h3 className="text-sm font-bold">Should I Hedge?</h3>
              </div>
              <p className="text-green-100 text-xs mb-1">Get recommendation</p>
              <div className="flex items-center gap-1 text-green-300 group-hover:gap-2 transition-all text-xs">
                <span className="font-semibold">Get answer</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-md mx-auto text-center px-4">
          <h2 className="text-base md:text-2xl font-bold mb-2">Ready to Protect Your Farm?</h2>
          <p className="text-xs md:text-base text-green-100 mb-3">
            Join {farmerCount.toLocaleString()} farmers learning to hedge
          </p>
          <div className="flex gap-2 justify-center">
            <button className="flex-1 bg-white text-green-600 px-4 py-2 rounded-lg font-semibold text-xs md:text-base hover:bg-green-50 transition-all shadow-md">
              Start Module 1
            </button>
            <button className="flex-1 bg-green-800/50 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg font-semibold text-xs md:text-base hover:bg-green-800/70 transition-all">
              Download
            </button>
          </div>
          <p className="mt-2 text-green-200 text-[10px] md:text-sm">
            No credit card required  •  Learn at your own pace  •  Certificate upon completion
          </p>
        </div>
      </section>
    </div>
  );
}
