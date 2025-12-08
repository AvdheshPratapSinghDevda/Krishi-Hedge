'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, BookOpen, Award, ChevronDown, ChevronUp } from 'lucide-react';

export default function Module1Page() {
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const sections = [
    { id: 1, title: "What is Hedging in Plain English", duration: "5 min" },
    { id: 2, title: "How Futures Work for Farmers", duration: "7 min" },
    { id: 3, title: "Your First Hedge - Step by Step", duration: "8 min" }
  ];

  const markSectionComplete = (sectionId: number) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
    if (sectionId < sections.length) {
      setCurrentSection(sectionId + 1);
    }
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  const quizQuestions = [
    {
      id: 1,
      question: "You hedge your soybeans at ₹1,200/bushel in June. At harvest, cash price is ₹1,100. You close your hedge. What happens?",
      options: [
        { id: 'a', text: "You lost money and shouldn't have hedged" },
        { id: 'b', text: "Your hedge made ₹100/bu profit, offsetting the lower cash price" },
        { id: 'c', text: "You have to deliver soybeans to Chicago" },
        { id: 'd', text: "You can't sell your grain locally" }
      ],
      correct: 'b',
      explanation: "Correct! Your hedge gained ₹100 (₹1,200 - ₹1,100), which offsets the lower cash price. You sell locally at ₹1,100 cash + ₹100 hedge profit = ~₹1,200 total. This is exactly how hedging protects you."
    },
    {
      id: 2,
      question: "You should hedge 100% of your expected crop to eliminate all risk.",
      options: [
        { id: 'true', text: "True" },
        { id: 'false', text: "False" }
      ],
      correct: 'false',
      explanation: "Most farmers hedge 20-50% to protect against downside while keeping flexibility. Hedging 100% means you can't benefit if prices rally. Balance is key."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
        <div className="max-w-md mx-auto px-4">
          <Link href="/learn-hedging" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Learning Path</span>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-3">
                Level 1
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Module 1: Hedging Basics</h1>
              <p className="text-green-100 text-sm md:text-base">Learn what hedging is and how it protects your farm - in plain English</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{completedSections.length}/{sections.length}</div>
              <div className="text-sm text-green-100">Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${(completedSections.length / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        {/* Sidebar Navigation - Hidden on mobile, shown on larger screens */}
        <div className="hidden md:block mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Sections</h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all text-xs ${
                    currentSection === section.id
                      ? 'bg-green-100 border-2 border-green-500'
                      : completedSections.includes(section.id)
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {completedSections.includes(section.id) && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                        <span className="font-semibold">{section.title}</span>
                      </div>
                      <div className="text-gray-500 text-[10px] mt-0.5">{section.duration}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Section 1: What is Hedging */}
          {currentSection === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Hedging in Plain English?</h2>

                {/* Video Player Placeholder */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-12 mb-8 text-center text-white">
                  <Play className="w-20 h-20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Introduction Video</h3>
                  <p className="text-green-100 mb-4">Watch: What is hedging? (3:42)</p>
                  <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition-all">
                    Play Video
                  </button>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Think of it Like Crop Insurance, But for Prices</h3>
                    <p className="text-gray-700">
                      Here's the simple truth: You grow crops. Prices go up and down. Hedging lets you "lock in" a price you can live with, 
                      so you know what you'll get paid—even if market prices crash later.
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Real Farm Example</h3>
                  <div className="bg-green-50 rounded-xl p-6 mb-6">
                    <p className="text-gray-800 mb-4">
                      <strong>March:</strong> Fall soybeans are trading at ₹1,150/bushel. Your break-even is ₹1,000/bushel.
                    </p>
                    <p className="text-gray-800 mb-4">
                      <strong>You hedge:</strong> Lock in that ₹1,150 price (minus some small costs).
                    </p>
                    <p className="text-gray-800 mb-4">
                      <strong>September harvest:</strong> Prices crashed to ₹900/bushel. Everyone else is hurting.
                    </p>
                    <p className="text-green-700 font-bold text-lg">
                      <strong>You still get around ₹1,150</strong> because your hedge made up the difference!
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive: See How It Works</h3>
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Move the slider: What if harvest price is...
                      </label>
                      <input 
                        type="range" 
                        min="800" 
                        max="1400" 
                        step="25" 
                        defaultValue="1150"
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>₹800</span>
                        <span>₹1100</span>
                        <span>₹1400</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">Without Hedge</h4>
                        <div className="text-3xl font-bold text-red-600">₹900/bu</div>
                        <div className="text-sm text-gray-600 mt-2">You get market price - ouch!</div>
                      </div>

                      <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">With Hedge at ₹1,150</h4>
                        <div className="text-3xl font-bold text-green-600">~₹1,150/bu</div>
                        <div className="text-sm text-gray-600 mt-2">Protected! Hedge gain offsets loss</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span></span>
                      Key Takeaway
                    </h4>
                    <p className="text-gray-700">
                      Hedging doesn't predict prices. It <strong>protects</strong> you from losing money when prices fall. 
                      Think of it as insurance - you pay a little (margin, time, effort) to avoid losing a lot.
                    </p>
                  </div>
                </div>

                {/* Complete Section Button */}
                <button
                  onClick={() => markSectionComplete(1)}
                  disabled={completedSections.includes(1)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    completedSections.includes(1)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {completedSections.includes(1) ? 'Section Completed' : 'Mark Complete & Continue →'}
                </button>
              </div>
            )}

            {/* Section 2: How Futures Work */}
            {currentSection === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How Futures Work for Farmers</h2>

                {/* Comic-Style Visual Story */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">The Farmer's Journey (Visual Story)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="text-4xl mb-3 text-center"></div>
                      <div className="font-bold text-center mb-2">May: Planting</div>
                      <p className="text-sm text-gray-700 text-center">
                        John plants corn. Worried about fall prices dropping.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                      <div className="text-4xl mb-3 text-center"></div>
                      <div className="font-bold text-center mb-2">June: Hedging</div>
                      <p className="text-sm text-gray-700 text-center">
                        Sells futures contract at ₹450/bu to lock in price.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                      <div className="text-4xl mb-3 text-center"></div>
                      <div className="font-bold text-center mb-2">October: Harvest</div>
                      <p className="text-sm text-gray-700 text-center">
                        Market at ₹400. Hedge gains ₹50. Still nets ~₹450!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Message Box */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-8 mb-8">
                  <h3 className="text-2xl font-bold mb-4">Critical Point - You DON'T Deliver to Chicago</h3>
                  <p className="text-lg text-green-100 mb-4">
                    98% of farmers <strong>close their hedge before delivery</strong>. You never ship grain anywhere. 
                  </p>
                  <p className="text-green-50">
                    It's just a math tool: You sell futures at $4.50, buy them back at $4.00, pocket the $0.50 difference. 
                    Then sell your physical grain locally like always.
                  </p>
                </div>

                {/* How it Actually Works */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">The Math in Your Pocket</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Sell futures (June)</span>
                      <span className="font-bold text-gray-900">$4.50/bu</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Buy back futures (October)</span>
                      <span className="font-bold text-green-600">-$4.00/bu</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-300">
                      <span className="text-gray-900 font-bold">Futures Profit</span>
                      <span className="font-bold text-green-700 text-xl">+$0.50/bu</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Sell grain locally (October)</span>
                      <span className="font-bold text-gray-900">$4.00/bu</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-300">
                      <span className="text-gray-900 font-bold">Total You Receive</span>
                      <span className="font-bold text-blue-700 text-2xl">~$4.50/bu</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => markSectionComplete(2)}
                  disabled={completedSections.includes(2)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    completedSections.includes(2)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {completedSections.includes(2) ? 'Section Completed' : 'Mark Complete & Continue →'}
                </button>
              </div>
            )}

            {/* Section 3: Your First Hedge */}
            {currentSection === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Your First Hedge - Step by Step</h2>

                <div className="space-y-4 mb-8">
                  {[
                    {
                      step: 1,
                      title: "Know Your Costs",
                      description: "Calculate your true break-even price per bushel",
                      action: "Use break-even calculator",
                      link: "/learn-hedging/calculators/break-even"
                    },
                    {
                      step: 2,
                      title: "Decide How Much to Hedge",
                      description: "Start with 25-30% of expected production",
                      action: "Conservative approach for beginners"
                    },
                    {
                      step: 3,
                      title: "Check Current Futures Prices",
                      description: "See what the market is offering today",
                      action: "View live markets"
                    },
                    {
                      step: 4,
                      title: "Open Brokerage Account",
                      description: "Choose a farmer-friendly broker",
                      action: "See recommended brokers"
                    },
                    {
                      step: 5,
                      title: "Place Your First Hedge",
                      description: "Sell futures contracts for your protection",
                      action: "Watch video walkthrough"
                    },
                    {
                      step: 6,
                      title: "Track Your Position",
                      description: "Monitor daily, but don't panic on small moves",
                      action: "Download tracking spreadsheet"
                    },
                    {
                      step: 7,
                      title: "Close Out Before Harvest",
                      description: "Exit 2-4 weeks before contract expiration",
                      action: "Set calendar reminder"
                    }
                  ].map((item) => (
                    <div key={item.step} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-700 mb-3">{item.description}</p>
                          <button className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1">
                            {item.action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => markSectionComplete(3)}
                  disabled={completedSections.includes(3)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    completedSections.includes(3)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {completedSections.includes(3) ? 'Section Completed' : 'Mark Complete & Take Quiz →'}
                </button>
              </div>
            )}

            {/* Quiz Section */}
            {completedSections.length === sections.length && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-8 h-8 text-green-600" />
                  <h2 className="text-3xl font-bold text-gray-900">Module Quiz</h2>
                </div>

                <p className="text-gray-600 mb-6">Test your knowledge! Pass with 4/5 to earn your certificate.</p>

                <div className="space-y-6">
                  {quizQuestions.map((q) => (
                    <div key={q.id} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Question {q.id}: {q.question}</h3>
                      <div className="space-y-2">
                        {q.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setQuizAnswers({...quizAnswers, [q.id]: option.id})}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              quizSubmitted && option.id === q.correct
                                ? 'border-green-500 bg-green-50'
                                : quizSubmitted && quizAnswers[q.id] === option.id && option.id !== q.correct
                                ? 'border-red-500 bg-red-50'
                                : quizAnswers[q.id] === option.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                quizAnswers[q.id] === option.id ? 'border-green-600 bg-green-600' : 'border-gray-300'
                              }`}>
                                {quizAnswers[q.id] === option.id && (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <span className="text-gray-800">{option.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                          <p className="text-sm text-gray-700">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl mt-6 transition-all"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
                    <div className="text-5xl mb-3">🎉</div>
                    <h3 className="text-2xl font-bold text-green-700 mb-2">Great Job!</h3>
                    <p className="text-gray-700 mb-4">You've completed Module 1: Hedging Basics</p>
                    <Link
                      href="/learn-hedging"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg transition-all"
                    >
                      Continue to Module 2 →
                    </Link>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
