import logo from '../assets/sgl.svg'

export default function Home() {
  return (<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center justify-center">
        <ol className="flex flex-col flex-center text-md font-[family-name:var(--font-geist-mono)]">
          <div className="ml-auto mr-auto m-4">
            <img className="max-w-[200px]" src={logo} alt={'logo'}/>
          </div>
          <li className="mb-2">
            Benvenuto nel tuo spazio digitale di Scuola Guida Lugano
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="/login"
            rel="noopener noreferrer">
            Login
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="/register"
            rel="noopener noreferrer">
            Register
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://scuolaguidalugano.ch"
          target="_blank"
          rel="noopener noreferrer">
          Sito scuola guida
        </a>
      </footer>
    </div>);
}
