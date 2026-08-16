import React, { useState } from 'react';
import { ADVOCATES_DIRECTORY } from '../data/expertAdvocates';
import type { AdvocateProfile } from '../types';
import { UserCheck, Star, MapPin, ShieldCheck, MessageSquare, CheckCircle } from 'lucide-react';

export const ExpertHub: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [bookingSuccessAdvocate, setBookingSuccessAdvocate] = useState<AdvocateProfile | null>(null);

  const cities = ['All', ...Array.from(new Set(ADVOCATES_DIRECTORY.map(a => a.city)))];

  const filteredAdvocates = selectedCity === 'All'
    ? ADVOCATES_DIRECTORY
    : ADVOCATES_DIRECTORY.filter(a => a.city === selectedCity);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Verified Bar Council Advocates</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Connect with Verified <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Legal Experts</span>
          </h1>
          <p className="text-xs text-slate-400">
            Have high-stakes contracts or court litigation? Book 1-on-1 consultations with verified Indian Bar Council lawyers.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCity === city
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Advocates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvocates.map(adv => (
          <div key={adv.id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors">
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-start space-x-4">
                <img
                  src={adv.avatarUrl}
                  alt={adv.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30 shadow-md"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-base">{adv.name}</h3>
                    <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{adv.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-400 font-medium">{adv.title}</p>
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{adv.city}, {adv.state} • {adv.experienceYears} Yrs Exp</span>
                  </p>
                </div>
              </div>

              {/* Bar License Tag */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Bar Reg</span>
                </span>
                <span className="font-mono text-slate-400">{adv.barCouncilNumber}</span>
              </div>

              {/* Specializations */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Key Expertise:</span>
                <div className="flex flex-wrap gap-1.5">
                  {adv.specialization.map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 text-[11px] border border-slate-700/60">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Booking Row */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                <span className="text-base font-extrabold text-amber-400">₹{adv.consultationFee} <span className="text-[10px] text-slate-400 font-normal">/ 30 mins</span></span>
              </div>

              <button
                onClick={() => setBookingSuccessAdvocate(adv)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Book Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal Confirmation */}
      {bookingSuccessAdvocate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-amber-500/40 space-y-4 animate-fadeIn text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">Consultation Scheduled!</h3>
              <p className="text-xs text-slate-300">
                Your request to consult with <strong>{bookingSuccessAdvocate.name}</strong> ({bookingSuccessAdvocate.title}) has been confirmed.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
              <p>📍 Location: Online Video Call / Audio Conference</p>
              <p>💳 Fee: ₹{bookingSuccessAdvocate.consultationFee} (Payable post consultation)</p>
              <p>📜 Registration Verified: {bookingSuccessAdvocate.barCouncilNumber}</p>
            </div>

            <button
              onClick={() => setBookingSuccessAdvocate(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
