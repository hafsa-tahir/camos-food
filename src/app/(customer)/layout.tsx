import Navbar from '@/components/layout/Navbar'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 68, minHeight: '100vh', background: '#FFFFEF' }}>
        {children}
      </main>
    </>
  )
}
