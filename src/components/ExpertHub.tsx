import React, { useState } from 'react';
import { ADVOCATES_DIRECTORY } from '../data/expertAdvocates';
import type { AdvocateProfile } from '../types';
import { UserCheck, Star, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const ExpertHub: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedAdvocate, setSelectedAdvocate] = useState<AdvocateProfile | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const [bookingForm, setBookingForm] = useState({
    userName: '',
    userPhone: '',
    preferredDate: '',
    caseDescription: ''
  });

  const cities: string[] = ['All', ...Array.from(new Set(ADVOCATES_DIRECTORY.map((a: AdvocateProfile) => a.city)))];

  const filteredAdvocates: AdvocateProfile[] = selectedCity === 'All'
    ? ADVOCATES_DIRECTORY
    : ADVOCATES_DIRECTORY.filter((a: AdvocateProfile) => a.city === selectedCity);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.userName || !bookingForm.userPhone) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedAdvocate(null);
      setBookingForm({ userName: '', userPhone: '', preferredDate: '', caseDescription: '' });
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white shadow-sm p-6 sm:p-8 rounded-2xl border border-stone-200 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-legal-100 border border-legal-200 text-legal-800 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Advocates Directory & Independent Legal Counsel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900">
              Connect with Experienced <span className="text-legal-700">Bar Council Advocates</span>
            </h1>
            <p className="text-slate-700 text-sm leading-relaxed">
              AI provides automated plain-language drafting assistance. For high-stakes property disputes, court litigation, or complex corporate drafting, consult an independent legal practitioner.
            </p>
          </div>

          {/* City Filter */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 self-stretch md:self-auto space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block uppercase">Filter Advocates by City:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-500 focus:border-legal-500 w-full"
            >
              {cities.map((city: string, i: number) => (
                <option key={i} value={city}>{city === 'All' ? 'All Indian Cities' : city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvocates.map((advocate: AdvocateProfile) => (
          <div
            key={advocate.id}
            className="bg-white shadow-sm rounded-2xl p-5 border border-stone-200 flex flex-col justify-between space-y-4 hover:border-legal-400 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={advocate.avatarUrl}
                  alt={advocate.name}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">{advocate.name}</h3>
                    <span className="flex items-center space-x-1 text-xs text-legal-800 font-bold bg-legal-100 px-2 py-0.5 rounded border border-legal-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{advocate.rating}</span>
                    </span>
                  </div>
                  <p className="text-xs text-legal-700 font-bold">{advocate.title}</p>
                  <p className="text-[11px] text-slate-600 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{advocate.city}, {advocate.state}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Experience:</span>
                  <strong className="text-slate-900">{advocate.experienceYears}+ Years</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Bar Enrollment:</span>
                  <strong className="text-slate-700 font-mono text-[11px]">{advocate.barCouncilNumber}</strong>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {advocate.specialization.map((spec: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-600 block uppercase font-bold tracking-wider mb-0.5">Consultation Fee</span>
                <span className="text-sm font-bold text-slate-900">₹{advocate.consultationFee.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-normal"> / 30m</span></span>
              </div>

              <button
                onClick={() => setSelectedAdvocate(advocate)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-legal-600 hover:bg-legal-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedAdvocate && (
        <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-sm max-w-md w-full rounded-2xl p-6 border border-slate-300 space-y-4 relative animate-fadeIn">
            <button
              onClick={() => setSelectedAdvocate(null)}
              className="absolute top-4 right-4 text-slate-600 hover:text-slate-900"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Schedule Consultation</h3>
              <p className="text-xs text-slate-600">Booking 30-minute legal advice session with <strong>{selectedAdvocate.name}</strong></p>
            </div>

            {bookingSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-800 text-sm">Consultation Requested!</h4>
                <p className="text-xs text-slate-700">
                  The advocate's chamber will contact you at {bookingForm.userPhone} to confirm the appointment.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.userName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, userName: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-500 focus:border-legal-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.userPhone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, userPhone: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-500 focus:border-legal-500"
                    placeholder="+91 Mobile number"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Preferred Date</label>
                  <input
                    type="date"
                    value={bookingForm.preferredDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-500 focus:border-legal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Brief Description of Legal Matter</label>
                  <textarea
                    rows={3}
                    value={bookingForm.caseDescription}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, caseDescription: e.target.value }))}
                    placeholder="Describe your contract review or dispute details..."
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-500 focus:border-legal-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAdvocate(null)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-legal-600 hover:bg-legal-700 text-white text-xs font-bold shadow-sm"
                  >
                    Request Consultation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
