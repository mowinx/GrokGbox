'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';

function LandingInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [form, setForm] = useState({ name: '', phone: '', email: '', day: '', month: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [mode, setMode] = useState('signup');

  useEffect(() => {
    const ref = search.get('ref') || (typeof window !== 'undefined' ? localStorage.getItem('giftland_ref') : '');
    if (ref) setRefCode(ref);
  }, [search]);

  async function signin(e) {
    e.preventDefault();
    setLoading(true);
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) { alert(error.message); setLoading(false); return; }
    }
    setLoading(false);
    router.push('/home');
  }

  async function signup(e) {
    e.preventDefault();
    setLoading(true);
    if (supabase && form.email && form.password) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name, phone: form.phone, birthday_day: form.day, birthday_month: form.month } },
      });
      if (!error && data.user) {
        const code = (form.name || 'user').toLowerCase().replace(/\s+/g, '').slice(0, 10) + Math.floor(Math.random() * 99);
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.name,
          phone: form.phone,
          email: form.email,
          birthday_day: Number(form.day) || null,
          birthday_month: Number(form.month) || null,
          referral_code: code,
        });
        if (refCode) {
          if (data.session) {
            const { error: claimErr } = await supabase.rpc('claim_referral', { code: refCode });
            if (!claimErr) localStorage.removeItem('giftland_ref');
          }
        } else {
          localStorage.removeItem('giftland_ref');
        }
      }
    }
    setLoading(false);
    router.push('/home');
  }

  return (
    <div className="landing">
      <style>{`
        .landing { max-width: 430px; margin: 0 auto; background: #fff; min-height: 100vh; font-family: Inter, system-ui, sans-serif; }
        .landing .hero-img { width: 100%; height: 240px; object-fit: cover; display: block; }
        .landing .hero-content { background: #DC2626; padding: 24px 20px 32px; color: white; text-align: center; }
        .landing .badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 12px; }
        .landing .logo { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
        .landing .hero-content h1 { font-size: 24px; font-weight: 800; line-height: 1.3; margin-bottom: 12px; color: white; }
        .landing .hero-content p { font-size: 15px; line-height: 1.55; margin-bottom: 16px; color: white; }
        .landing .cta { display: block; background: white; color: #DC2626; font-weight: 800; padding: 16px 20px; border-radius: 28px; text-decoration: none; font-size: 16px; margin: 8px 0; text-align: center; }
        .landing .cta-dark { background: #DC2626; color: white; border: none; width: 100%; cursor: pointer; }
        .landing .mini { font-size: 12px; opacity: 0.85; margin-top: 10px; }
        .landing .chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 14px; }
        .landing .chip { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 16px; font-size: 11px; }
        .landing .section { padding: 32px 20px; }
        .landing .section h2 { font-size: 20px; font-weight: 800; line-height: 1.3; margin-bottom: 14px; }
        .landing .section p { font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 12px; }
        .landing .ways { background: #F9FAFB; }
        .landing .way { background: white; border-radius: 14px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .landing .way h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
        .landing .way p { font-size: 14px; color: #4B5563; margin: 0; }
        .landing .disclaimer { font-size: 12px; color: #9CA3AF; line-height: 1.5; margin-top: 16px; padding: 12px; background: #F3F4F6; border-radius: 10px; }
        .landing .signup { background: #FEE2E2; padding: 32px 20px 40px; }
        .landing .signup h2 { color: #DC2626; font-size: 22px; font-weight: 800; margin-bottom: 8px; }
        .landing .input { width: 100%; padding: 14px 16px; border: 1.5px solid #E5E7EB; border-radius: 12px; font-size: 16px; margin-bottom: 10px; background: white; }
        .landing .input:focus { outline: none; border-color: #DC2626; }
        .landing .row { display: flex; gap: 8px; }
        .landing .row > * { flex: 1; }
        .landing .note { font-size: 12px; color: #4B5563; text-align: center; margin-top: 10px; }
        .landing .faq { border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 8px; }
        .landing .faq-item { margin-bottom: 14px; }
        .landing .faq-item strong { display: block; font-size: 14px; margin-bottom: 4px; }
        .landing .faq-item p { font-size: 13px; color: #4B5563; margin: 0; }
        .landing .footer { text-align: center; padding: 24px 20px; font-size: 12px; color: #4B5563; background: #F9FAFB; }
      `}</style>

      <div className="hero">
        <img className="hero-img" src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80" alt="People celebrating a birthday" />
        <div className="hero-content">
          <div className="badge">🎁 BIRTHDAY SEASON</div>
          <div className="logo">Giftland</div>
          <h1>Your Birthday Comes Every Year. Your Chance to Get Gifted Starts Now.</h1>
          <p>Join Giftland for birthday surprises, anonymous gifts from around the world, referral rewards, and a chance to win our end-of-year grand prize.</p>
          <a className="cta" href="#signup">YES! I WANT TO JOIN GIFTLAND</a>
          <div className="mini">Sign up. Invite your people. Let the surprises begin.</div>
          <div className="chips">
            <span className="chip">Birthday gifts</span>
            <span className="chip">Referral rewards</span>
            <span className="chip">Anonymous surprises</span>
            <span className="chip">Grand raffle</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>What if your next birthday came with more than just birthday wishes?</h2>
        <p>Imagine waking up on your birthday to an unexpected gift. Imagine someone, somewhere in the world, choosing to make your day special. Imagine having a chance to win a birthday surprise, receive a gift during your birthday week or month, or even win our end-of-year grand raffle.</p>
        <p>That is the excitement of Giftland. And your invitation starts here.</p>
        <p>Join Giftland today, tell your friends, and become part of a community where birthdays create opportunities for beautiful surprises.</p>
        <a className="cta cta-dark" href="#signup">YES! I WANT TO JOIN GIFTLAND</a>
      </div>

      <div className="section" style={{ background: '#FFFBEB' }}>
        <h2>🎂 Everyone has a birthday. What if yours opened a door to something special?</h2>
        <p>You might not be getting married this year. You might not be celebrating an anniversary. You might not be hosting a big event.</p>
        <p><strong>But your birthday? That comes around every year.</strong></p>
        <p>At Giftland, we believe birthdays deserve more than a post on social media and a few birthday messages. They deserve excitement. They deserve surprises. They deserve the possibility of receiving something that makes you smile.</p>
        <p>That is why we are turning birthdays into opportunities to be celebrated, gifted, and remembered.</p>
        <a className="cta cta-dark" href="#signup">CREATE MY GIFTLAND ACCOUNT</a>
      </div>

      <div className="section ways">
        <h2>🎁 Four ways your birthday could become extra special</h2>
        <div className="way"><h3>1. Your Birthday. Your Surprise.</h3><p>Your birthday is your moment. With Giftland, you get the opportunity to be considered for birthday gifts and surprises around your special day.</p></div>
        <div className="way"><h3>2. Your Birthday Week Could Bring Something Beautiful.</h3><p>The celebration does not have to stop on your birthday. Your birthday week could be another opportunity to receive a special surprise.</p></div>
        <div className="way"><h3>3. Why Stop at a Day? Celebrate Your Birthday Month!</h3><p>One day is wonderful. An entire month of birthday excitement? Even better. Join and participate in eligible birthday-month gift opportunities.</p></div>
        <div className="way"><h3>4. The Grand Raffle.</h3><p>We are bringing even more anticipation to the end of the year with the Giftland Grand Raffle. Join, participate according to the official campaign rules, and stand a chance to win the announced grand prize.</p></div>
        <a className="cta cta-dark" href="#signup" style={{ marginTop: 8 }}>I'M READY TO JOIN</a>
        <div className="disclaimer">Birthday gifts, birthday-week and birthday-month gifts, and raffle prizes are opportunities, not guaranteed rewards. Eligibility, entry requirements, prize details, and deadlines will be stated in the official campaign rules.</div>
      </div>

      <div className="section">
        <h2>🏆 Love sharing good things? Your referrals could make you a winner too.</h2>
        <p>When you discover something exciting, you want your friends to know about it. Now imagine inviting your friends to join Giftland and having your referrals count toward a special reward.</p>
        <p><strong>Meet the Giftland Top Referrer Challenge.</strong></p>
        <p>Invite your friends. Share your unique referral link. Encourage them to register and participate. The person who finishes at the top of the eligible referral leaderboard during the campaign could win a special prize.</p>
        <p>Your network could become your advantage. Don’t just join Giftland. Bring your people along for the experience.</p>
        <a className="cta cta-dark" href="#signup">JOIN & GET MY REFERRAL LINK</a>
        <div className="disclaimer">Referral rewards are subject to the published campaign dates, qualifying referral requirements, verification, and official terms. Self-referrals, duplicate accounts, and fraudulent registrations do not qualify.</div>
      </div>

      <div className="section" style={{ background: '#FEE2E2' }}>
        <h2>💌 Some gifts are even more special when you don’t know who sent them.</h2>
        <p>Imagine receiving a gift and asking yourself: “Who thought of me?” “Who could have sent this?” “Someone all the way across the world remembered me?”</p>
        <p>That feeling is priceless.</p>
        <p>With Giftland’s anonymous gifting feature, people can send gifts without revealing their identity to the recipient, subject to the platform’s rules and safeguards.</p>
        <p>A little mystery. A lot of excitement. A gift you didn’t see coming. And the beautiful part? You can also be the person who makes someone else’s day unforgettable.</p>
        <a className="cta cta-dark" href="#signup">I WANT TO EXPERIENCE ANONYMOUS GIFTING</a>
      </div>

      <div className="section">
        <h2>🌍 Your friends are part of the magic.</h2>
        <p>Birthdays are better when people celebrate with you. Invite your best friend. Your siblings. Your colleagues. Your classmates.</p>
        <p>Every eligible friend who signs up through your referral link can help you build your referral count and compete for the Top Referrer reward.</p>
        <p>One invitation could start something beautiful.</p>
        <a className="cta cta-dark" href="#signup">SIGN UP & INVITE MY FRIENDS</a>
      </div>

      <div className="section" style={{ background: '#FEF3C7' }}>
        <h2>🎉 Don’t wait until your birthday to get started.</h2>
        <p>Your birthday will come whether you sign up or not. The real question is: will you be part of the Giftland community when the birthday surprises, referral challenges, and grand raffle opportunities happen?</p>
        <p>Join early. Complete your birthday details. Watch for eligible campaigns. Share your referral link.</p>
      </div>

      <form className="signup" id="signup" onSubmit={mode === 'signup' ? signup : signin}>
        <h2>{mode === 'signup' ? 'Ready to make your birthday more exciting?' : 'Welcome back'}</h2>
        {refCode && mode === 'signup' && (
          <p style={{ textAlign: 'center', background: '#fff', color: '#B91C1C', borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            You were invited. Create your account and this sign-up counts for your friend.
          </p>
        )}
        <p style={{ textAlign: 'center', color: '#4B5563', marginBottom: 16, fontSize: 14 }}>
          {mode === 'signup' ? 'Create your Giftland account today. Then share your referral link and invite your friends.' : 'Sign in to your existing account.'}
        </p>
        {mode === 'signup' && <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
        {mode === 'signup' && <input className="input" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        {mode === 'signup' && (
          <div className="row">
            <input className="input" placeholder="Birthday day" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} />
            <input className="input" placeholder="Birthday month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
          </div>
        )}
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="cta cta-dark" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'signup' ? 'YES! SIGN ME UP FOR GIFTLAND 🎁' : 'SIGN IN'}
        </button>
        <p className="note" style={{ cursor: 'pointer' }} onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
          {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </p>
        {mode === 'signup' && <p className="note">Birthday (day & month) is used for raffle eligibility. Gifts and prizes are opportunities, not guaranteed.</p>}
      </form>

      <div className="section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          <div className="faq-item"><strong>Is Giftland only for people celebrating a birthday soon?</strong><p>No. You can join ahead of your birthday and participate in eligible campaigns when you meet their requirements.</p></div>
          <div className="faq-item"><strong>Will I definitely receive a birthday gift?</strong><p>Birthday gifts and prizes are not guaranteed. Eligible members may have opportunities to receive gifts through specific campaigns, subject to availability and the published rules.</p></div>
          <div className="faq-item"><strong>How do I participate in the grand raffle?</strong><p>Register for Giftland and follow the entry instructions in the official raffle announcement. Any additional eligibility requirements and deadlines will be published with the campaign rules.</p></div>
          <div className="faq-item"><strong>How can I compete for the Top Referrer reward?</strong><p>Use your unique referral link to invite friends. Only eligible, verified referrals count under the official referral campaign rules.</p></div>
          <div className="faq-item"><strong>Can someone send me an anonymous gift?</strong><p>Giftland’s anonymous gifting feature allows gifts to be sent without disclosing the sender’s identity to the recipient, subject to the platform’s rules and safeguards.</p></div>
          <div className="faq-item"><strong>Can I join if my birthday is several months away?</strong><p>Absolutely. You can sign up now, complete your profile, and stay informed about eligible birthday campaigns.</p></div>
          <div className="faq-item"><strong>Does joining guarantee that I will win a prize?</strong><p>No. Signing up gives you access to the platform and opportunities to participate in eligible campaigns; it does not guarantee a gift or prize.</p></div>
        </div>
      </div>

      <div className="section" style={{ textAlign: 'center', background: '#DC2626', color: 'white' }}>
        <h2 style={{ color: 'white' }}>Your birthday is already on the calendar. Let’s make it more exciting.</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>Join Giftland. Invite your friends. Celebrate the people you love. And give yourself the opportunity to be part of something special.</p>
        <a className="cta" href="#signup" style={{ marginTop: 16 }}>JOIN GIFTLAND TODAY 🎁</a>
        <p style={{ fontSize: 13, marginTop: 16, opacity: 0.85 }}>Giftland: Every celebration is an opportunity to make someone feel special.</p>
      </div>

      <div className="footer">© 2026 Giftland</div>
    </div>
  );
}

export default function Landing() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <LandingInner />
    </Suspense>
  );
}
