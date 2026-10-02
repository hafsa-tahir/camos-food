'use client'

import { useState } from 'react'
import { Target, TrendingDown, Activity, ArrowRight, CheckCircle, Flame } from 'lucide-react'
import Link from 'next/link'

const GOALS = [
  { value: 'lose_weight', label: 'Lose Weight', icon: TrendingDown, desc: '-500 kcal/day' },
  { value: 'maintain', label: 'Maintain', icon: Activity, desc: 'Balanced diet' },
  { value: 'gain_weight', label: 'Gain Weight', icon: Target, desc: '+300 kcal/day' },
]

const ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Lightly Active', desc: '1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
  { value: 'active', label: 'Active', desc: '6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Physical job + training' },
]

export default function DietPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    goal: 'maintain',
    activity: 'moderate',
  })
  const [result, setResult] = useState<{
    calories: number
    protein: number
    carbs: number
    fat: number
  } | null>(null)

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const calculate = () => {
    const w = parseFloat(form.weight),
      h = parseFloat(form.height),
      a = parseFloat(form.age)
    if (!w || !h || !a) return
    const bmr = form.gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
    const multiplier =
      { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[
        form.activity
      ] || 1.55
    const adj = { lose_weight: -500, maintain: 0, gain_weight: 300 }[form.goal] || 0
    const cal = Math.round(bmr * multiplier + adj)
    setResult({
      calories: cal,
      protein: Math.round((cal * 0.3) / 4),
      carbs: Math.round((cal * 0.4) / 4),
      fat: Math.round((cal * 0.3) / 9),
    })
    setStep(3)
  }

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#C7230F] mb-2">
          AI Diet Coach
        </h1>
        <p className="text-sm font-bold text-[#C7230F]/80 mb-8">
          Calculate your optimal daily calorie and macro target.
        </p>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= s ? 'bg-[#C7230F]' : 'bg-[#C7230F]/20'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#C7230F]/20 shadow-md">
            <h2 className="font-black text-xl text-[#C7230F] mb-6">Step 1: About You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-black text-[#C7230F] mb-1.5 uppercase tracking-wider">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => set('weight')(e.target.value)}
                  placeholder="70"
                  className="w-full p-3.5 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#C7230F] mb-1.5 uppercase tracking-wider">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => set('height')(e.target.value)}
                  placeholder="175"
                  className="w-full p-3.5 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#C7230F] mb-1.5 uppercase tracking-wider">
                  Age
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => set('age')(e.target.value)}
                  placeholder="25"
                  className="w-full p-3.5 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#C7230F] mb-1.5 uppercase tracking-wider">
                  Gender
                </label>
                <div className="flex gap-2">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => set('gender')(g)}
                      className={`flex-1 py-3.5 rounded-2xl font-black text-xs border-2 transition-all cursor-pointer uppercase tracking-wider ${
                        form.gender === g
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                          : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/20'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.weight || !form.height || !form.age}
              className="w-full bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-sm py-4 rounded-full border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 uppercase tracking-wider"
            >
              Next Step <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#C7230F]/20 shadow-md">
            <h2 className="font-black text-xl text-[#C7230F] mb-6">
              Step 2: Goal & Activity
            </h2>

            <div className="mb-6">
              <label className="block text-xs font-black text-[#C7230F] mb-2 uppercase tracking-wider">
                Select Your Goal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {GOALS.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => set('goal')(value)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      form.goal === value
                        ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-md'
                        : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/20'
                    }`}
                  >
                    <Icon size={22} className="mx-auto mb-2" />
                    <div className="font-black text-xs uppercase">{label}</div>
                    <div className="text-[10px] font-bold opacity-80 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-[#C7230F] mb-2 uppercase tracking-wider">
                Activity Level
              </label>
              <div className="flex flex-col gap-2">
                {ACTIVITY.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => set('activity')(value)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      form.activity === value
                        ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                        : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/20'
                    }`}
                  >
                    <span className="font-black text-xs uppercase">{label}</span>
                    <span className="text-[11px] font-bold opacity-80">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-[#FFFFEF] text-[#C7230F] font-black text-xs py-4 rounded-full border-2 border-[#C7230F]/20 cursor-pointer uppercase tracking-wider"
              >
                Back
              </button>
              <button
                onClick={calculate}
                className="flex-[2] bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs py-4 rounded-full border-none cursor-pointer shadow-lg uppercase tracking-wider"
              >
                Calculate Target
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div>
            <div className="bg-[#C7230F] rounded-3xl p-8 sm:p-12 mb-6 text-[#FFFFEF] shadow-2xl text-center border-2 border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame size={32} />
              </div>
              <h2 className="font-black text-xl mb-2">Your Daily Target</h2>
              <div className="font-black text-5xl sm:text-6xl text-white my-3">
                {result.calories}
              </div>
              <div className="text-sm font-bold text-[#FFFFEF]/90 uppercase tracking-widest">
                Calories Per Day
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 text-center border-2 border-[#C7230F]/20">
                <div className="font-black text-2xl text-[#C7230F]">{result.protein}g</div>
                <div className="text-xs font-black text-[#C7230F]/70 uppercase tracking-wider mt-1">PROTEIN</div>
              </div>

              <div className="bg-white rounded-2xl p-5 text-center border-2 border-[#C7230F]/20">
                <div className="font-black text-2xl text-[#C7230F]">{result.carbs}g</div>
                <div className="text-xs font-black text-[#C7230F]/70 uppercase tracking-wider mt-1">CARBS</div>
              </div>

              <div className="bg-white rounded-2xl p-5 text-center border-2 border-[#C7230F]/20">
                <div className="font-black text-2xl text-[#C7230F]">{result.fat}g</div>
                <div className="text-xs font-black text-[#C7230F]/70 uppercase tracking-wider mt-1">FAT</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-[#FFFFEF] text-[#C7230F] font-black text-xs py-4 rounded-full border-2 border-[#C7230F]/20 cursor-pointer uppercase tracking-wider"
              >
                Recalculate
              </button>
              <Link
                href="/menu"
                className="flex-[2] bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs py-4 rounded-full no-underline flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider"
              >
                Find Meals <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
