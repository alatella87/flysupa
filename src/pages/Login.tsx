import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {supabase} from '../services/supabaseClient.tsx'


export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setPassword('')
  }, [])

  const handleLogin = async (event: any) => {
    event.preventDefault()

    setLoading(true)

    const {error} = await supabase.auth.signInWithPassword({email, password});

    if (error) {
      alert(error.error_description || error.message)
    } else {
      navigate('/account')
    }
    setLoading(false)
  }

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div
          className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1
              className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Accedi / Registra <br/> Scuola Guida Lugano
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm text-gray-900 dark:text-white">
                  Mail
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full text-[#1f2937]">
                Log In
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400 flex justify-between">
                Non hai ancora un account?
                <Link
                  className="link text-base-content link-neutral"
                  to="/register">
                  <span className="ml-1 font-bold">
                  Registrati
                </span>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
