import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  // State to manage which dropdown is open
  const [activeMenu, setActiveMenu] = useState(null);

  // Dropdown content data
  const menuData = {
    Platform: ["Dashboard", "Analytics", "Workflow Builder", "API Access"],
    Features: ["Video Editing", "Collaboration Tools", "Automated Ledgers", "Feedback Loops"],
    Solutions: ["For Editors", "For Stakeholders", "For Agencies", "Enterprise"],
    Community: ["Forum", "Events", "Success Stories", "Blog"]
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f2ff] to-[#ffffff] text-slate-800 font-sans" onClick={() => setActiveMenu(null)}>
      
      {/* Top Utility Bar */}
      <nav className="flex justify-between items-center px-10 py-4 bg-white/30 backdrop-blur-md border-b border-blue-200 sticky top-0 z-50">
        <div className="flex gap-6 text-[#1734a1] font-semibold">
          <span className="hover:underline cursor-pointer">Updates</span>
          <span className="hover:underline cursor-pointer">Legal Guide</span>
          <span className="hover:underline cursor-pointer">About Us</span>
          <span className="hover:underline cursor-pointer">Services</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="bg-black text-white px-8 py-1.5 rounded-full text-sm font-medium hover:opacity-80 transition">LogIn</button>
          <button onClick={() => navigate('/roles')} className="bg-[#1734a1] text-white px-8 py-1.5 rounded-full text-sm font-medium hover:bg-blue-800 transition">SignUp</button>
        </div>
      </nav>

      {/* Secondary Navigation with Pop-ups */}
      <div className="flex justify-end gap-8 px-16 py-6 font-medium text-slate-700 relative">
        {Object.keys(menuData).map((menu) => (
          <div key={menu} className="relative" onClick={(e) => e.stopPropagation()}>
            <span 
              className={`cursor-pointer hover:text-blue-600 transition flex items-center gap-1 ${activeMenu === menu ? 'text-blue-600' : ''}`}
              onClick={() => toggleMenu(menu)}
            >
              {menu} {menu !== "Community" && "▾"}
            </span>
            
            {/* Pop-up Div (Dropdown) */}
            {activeMenu === menu && (
              <div className="absolute top-10 right-0 w-98 bg-white border border-blue-100 shadow-xl rounded-2xl p-4 z-40 animate-in fade-in slide-in-from-top-2">
                <ul className="space-y-3">
                  {menuData[menu].map((item) => (
                    <li key={item} className="text-sm text-slate-600 hover:text-[#1734a1] cursor-pointer hover:font-bold transition-all">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <header className="flex flex-col md:flex-row items-center justify-between px-16 py-10 max-w-7xl mx-auto">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-[#1734a1] text-6xl font-black italic tracking-tighter">Contify</h1>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">Where Content <br /> Meets Collaboration</h2>
          <p className="text-lg text-slate-600 max-w-md">The all-in-one ecosystem for stakeholders to commission, admins to manage, and editors to produce world-class video content.</p>
          <div className="flex gap-4 pt-4">
            <button onClick={() => navigate('/roles')} className="bg-[#1734a1] text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-800 transition">Find your Role</button>
            <button className="bg-[#4d6ecf] text-white px-6 py-3 rounded-lg font-medium shadow-md">Find Your Next Project</button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-end">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/content-creator-making-video-illustration-download-in-svg-png-gif-file-formats--blogger-logo-like-influencer-pack-science-technology-illustrations-3605633.png" alt="Hero" className="w-[600px] drop-shadow-2xl" />
        </div>
      </header>

      {/* Mid Section Text */}
      <section className="text-center py-16 px-6 bg-white/40">
        <p className="text-2xl font-medium text-slate-800 max-w-2xl mx-auto italic">"Celebrate success, encourage growth, and strengthen your workplace culture."</p>
      </section>

      {/* Feature Cards with Images */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-16 max-w-7xl mx-auto mb-20">
        <FeatureCard 
          image="https://illustrations.popsy.co/blue/shaking-hands.svg" 
          title="Editor Collaboration" 
          desc="Scale your video productions with seamless team integration." 
        />
        <FeatureCard 
          image="https://static.vecteezy.com/system/resources/previews/017/585/169/large_2x/customer-feedback-and-user-experience-illustration-characters-giving-review-to-customer-service-operator-choosing-emoji-to-show-satisfaction-rating-and-filling-survey-form-flat-illustration-vector.jpg"
          title="Give Feedback" 
          desc="Real-time frame-accurate feedback for editors and stakeholders." 
        />
        <FeatureCard 
          image="https://illustrations.popsy.co/blue/digital-nomad.svg" 
          title="Automated Ledger" 
          desc="Transparent payments that flow without invoice headaches." 
        />
      </section>

      {/* Bottom CTA */}
      <div className="flex justify-center gap-6 mb-32">
        <button onClick={() => navigate('/roles')} className="bg-[#1734a1] text-white px-10 py-3 rounded-lg text-xl flex items-center gap-2 hover:bg-blue-800 hover:scale-105 transition-all">
          Get Started <span>→</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white/50 pt-16">
        <div className="max-w-7xl mx-auto px-16 grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h4 className="font-bold text-lg mb-6">New to Contify ?</h4>
            <ul className="space-y-2 text-[#1734a1] font-semibold">
              <li className="cursor-pointer hover:underline">What is Contify?</li>
              <li className="cursor-pointer hover:underline">Stakeholders</li>
              <li className="cursor-pointer hover:underline">Admin</li>
              <li className="cursor-pointer hover:underline">Editors</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-2 text-[#1734a1] font-semibold">
              <li className="cursor-pointer hover:underline">Home</li>
              <li className="cursor-pointer hover:underline">About Us</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-200 py-6 px-16 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2 text-slate-600"><span>📧</span> support@contify.com</div>
           <div className="flex gap-6 text-base text-slate-700 font-medium">
             <a href="https://x.com" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-blue-600 transition">X</a>
             <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-blue-600 transition">Facebook</a>
             <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition underline">LinkedIn</a>
           </div>
        </div>
        <div className="bg-[#1734a1] text-white py-3 text-center font-medium italic">@ 2026 Contify</div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ image, title, desc }) => (
  <div className="bg-white/80 p-8 rounded-[40px] border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col items-center text-center group">
    <div className="w-32 h-32 mb-6 flex items-center justify-center bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
      <img src={image} alt={title} className="w-24 h-24 object-contain" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-[#1734a1]">{title}</h3>
    <p className="text-slate-600 text-sm">{desc}</p>
  </div>
);

export default Landing;
