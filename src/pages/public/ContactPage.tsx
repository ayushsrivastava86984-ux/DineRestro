import React, { useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle2, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { validateEmail } from '../../utils/formatters';

const FAQS = [
  {
    q: 'Are reservations made in this preview live restaurant bookings?',
    a: 'No. Phase 1 is a frontend-only demonstration using local simulated state. Bookings created here demonstrate the user flow and appear inside the demo dashboards without sending live requests to restaurants.',
  },
  {
    q: 'Which localities in Varanasi are featured at launch?',
    a: 'Featured sample venues span Assi Ghat, Nadesar, Dashashwamedh, Rathyatra, Sigra, Cantonment, Lanka, and Godowlia.',
  },
  {
    q: 'How do restaurant owners join DineRestro?',
    a: 'Hospitality owners can submit their venue profile through the Partner With Us registration form (/restaurant/signup) for curation review.',
  },
  {
    q: 'Can I inquire about group celebrations like birthdays or anniversaries?',
    a: 'Yes. Visit the Events page to select your celebration category and submit a customized guest count and budget inquiry.',
  },
];

export function ContactPage() {
  const { submitSupportTicket } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState<'Customer' | 'Restaurant Partner'>('Customer');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !subject.trim() || !message.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    submitSupportTicket({
      userName: name.trim(),
      userRole: roleType,
      subject: subject.trim(),
      message: message.trim(),
      priority: 'Medium',
    });
    setSent(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
                Get in Touch
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                Contact &amp; Help Center
              </h1>
              <p className="text-sm text-[#6B5F5C] mt-2 leading-relaxed">
                Questions about dining in Varanasi, celebration planning, or restaurant onboarding? Reach our local hospitality desk.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#E8DDD1] pt-5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#702C3A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#292321]">Varanasi Launch Office</p>
                  <p className="text-[#6B5F5C]">Sigra Commercial Complex, Varanasi, UP 221010</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#702C3A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#292321]">Concierge Email</p>
                  <p className="text-[#6B5F5C]">concierge@dinerestro.example.in</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#702C3A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#292321]">Partner Support Desk</p>
                  <p className="text-[#6B5F5C] tabular-nums">+91 542 220 4810 (10 AM – 8 PM IST)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[#292321] mb-1">
              Send a Message (Demo Support Queue)
            </h2>
            <p className="text-xs text-[#6B5F5C] mb-5">
              Submitted inquiries are logged directly into the Admin Support Tickets view in demo state.
            </p>

            {sent ? (
              <div className="bg-white border border-[#C8D8AC] rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#702C3A] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Message Logged in Demo Queue</span>
                </div>
                <p className="text-sm text-[#6B5F5C]">
                  Thank you, {name}. Your support note has been recorded locally for Phase 1 demonstration.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#FDECEF] border border-[#F4A6B8] text-xs font-medium text-[#702C3A]">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      I am a
                    </label>
                    <select
                      value={roleType}
                      onChange={(e) => setRoleType(e.target.value as typeof roleType)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    >
                      <option value="Customer">Customer / Diner</option>
                      <option value="Restaurant Partner">Restaurant Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Booking inquiry or partner help"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our Varanasi team assist you?"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
                >
                  Send Message (Demo)
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Help Center & FAQ */}
        <section id="faq" className="border-t border-[#E8DDD1] pt-12">
          <div id="help-center" className="max-w-3xl">
            <h2 className="font-display text-3xl font-semibold text-[#292321] mb-6">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-[#E8DDD1] border border-[#E8DDD1] rounded-lg">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                    >
                      <span className="text-sm font-semibold text-[#292321]">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#702C3A] shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-[#6B5F5C] leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
