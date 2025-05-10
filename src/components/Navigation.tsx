import React, { useEffect, useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Search, User, Menu, LogOut, ShoppingCart, X, LogIn } from 'lucide-react'; // Removed Star icon as it's replaced by image
    import { NotificationBell } from './NotificationBell';
    import { ShoppingCart as CartComponent } from './ShoppingCart';
    import { useTranslation } from 'react-i18next';
    import { supabase } from '../lib/supabase';
    import { useCartStore } from '../stores/cartStore';
    import toast from 'react-hot-toast';

    export function Navigation() {
      const navigate = useNavigate();
      const { t } = useTranslation();
      const [user, setUser] = useState<any>(null);
      const [isCreator, setIsCreator] = useState(false);
      const [isAdmin, setIsAdmin] = useState(false);
      const [loading, setLoading] = useState(true);
      const [isCartOpen, setIsCartOpen] = useState(false);
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const { items, removeItem, clearCart } = useCartStore();

      const siteLogoUrl = "https://answerme.co.il/mystar/logo.png"; // Define the logo URL

      useEffect(() => {
        checkUser();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            checkUserRoles(session.user.id);
          } else {
            setIsCreator(false);
            setIsAdmin(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }, []);

      async function checkUser() {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            toast.error('Error checking authentication status');
            throw sessionError;
          }
          
          setUser(session?.user ?? null);
          if (session?.user) {
            await checkUserRoles(session.user.id);
          }
        } catch (error) {
          console.error('Error checking auth state:', error);
          toast.error('Error checking authentication status');
          setUser(null);
          setIsCreator(false);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      }

      async function checkUserRoles(userId: string) {
        try {
          // First check if the user exists in the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', userId)
            .maybeSingle();

          if (userError) {
            if (userError.code === 'PGRST301') {
              // Database connection error
              toast.error('Unable to connect to the database. Please try again later.');
            } else {
              toast.error('Error checking user status');
            }
            console.error('Error checking user existence:', userError);
            setIsCreator(false);
            setIsAdmin(false);
            return;
          }

          // If user doesn't exist, don't check creator status
          if (!userData) {
            setIsCreator(false);
            setIsAdmin(false);
            return;
          }

          // Check if user is admin
          setIsAdmin(userData.role === 'admin');

          // Now check creator status
          const { data: creatorData, error: creatorError } = await supabase
            .from('creator_profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
          
          if (creatorError) {
            console.error('Error checking creator status:', creatorError);
            toast.error('Error checking creator status');
            setIsCreator(false);
            return;
          }
          
          setIsCreator(!!creatorData);
        } catch (error) {
          console.error('Error checking user roles:', error);
          toast.error('Network error. Please check your connection.');
          setIsCreator(false);
          setIsAdmin(false);
        }
      }

      async function handleSignOut() {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          // Clear local storage
          localStorage.clear();
          setUser(null);
          setIsCreator(false);
          setIsAdmin(false);
          navigate('/');
          toast.success('Successfully signed out');
        } catch (error) {
          console.error('Error signing out:', error);
          toast.error('Error signing out');
        }
      }

      return (
        <nav className="bg-white shadow-md" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Left side (becomes right in RTL) */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700">
                  {/* Use img tag for the logo */}
                  <img src={siteLogoUrl} alt="MyStar Logo" className="h-10 w-auto" />
                </Link>
              </div>

              {/* Center Links (becomes center in RTL) */}
              <div className="hidden sm:flex sm:items-center sm:space-x-8 sm:space-x-reverse">
                <Link to="/explore" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                  {t('navigation.explore')}
                </Link>
                <Link to="/categories" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  {t('navigation.categories')}
                </Link>
                {user && (
                  <>
                    {isAdmin && (
                      <Link to="/dashboard/Joseph999" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                        לוח בקרה מנהל
                      </Link>
                    )}
                    {isCreator && !isAdmin && (
                      <Link to="/dashboard/creator" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                        לוח בקרה יוצר
                      </Link>
                    )}
                    {!isCreator && !isAdmin && (
                      <Link to="/dashboard/fan" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                        לוח בקרה מעריץ
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Right side (becomes left in RTL) */}
              <div className="flex items-center">
                <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4 sm:space-x-reverse">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('navigation.search')}
                      className="w-64 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  {user && (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="relative p-2 text-gray-600 hover:text-gray-900"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      {items.length > 0 && (
                        <span className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {items.length}
                        </span>
                      )}
                    </button>
                  )}
                  
                  {user ? (
                    <>
                      <NotificationBell />
                      
                      <div className="relative group">
                        <button className="flex items-center space-x-2 space-x-reverse p-2 rounded-full hover:bg-gray-100">
                          <img
                            src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`}
                            alt="Profile"
                            className="h-8 w-8 rounded-full"
                          />
                        </button>
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                          {isAdmin && (
                            <Link
                              to="/dashboard/Joseph999"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-right"
                            >
                              לוח בקרה מנהל
                            </Link>
                          )}
                          {isCreator && !isAdmin && (
                            <Link
                              to="/dashboard/creator"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-right"
                            >
                              לוח בקרה ליוצר
                            </Link>
                          )}
                          {!isCreator && !isAdmin && (
                            <Link
                              to="/dashboard/fan"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-right"
                            >
                              לוח בקרה למעריץ
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <div className="flex items-center justify-end">
                              <span className="ml-2">התנתק</span>
                              <LogOut className="h-4 w-4" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                        title="התחבר"
                      >
                        <LogIn className="h-6 w-6" />
                      </Link>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                  <Link
                    to="/explore"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('navigation.explore')}
                  </Link>
                  <Link
                    to="/categories"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('navigation.categories')}
                  </Link>
                  {user && (
                    <>
                      {isAdmin && (
                        <Link
                          to="/dashboard/Joseph999"
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          לוח בקרה מנהל
                        </Link>
                      )}
                      {isCreator && !isAdmin && (
                        <Link
                          to="/dashboard/creator"
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          לוח בקרה יוצר
                        </Link>
                      )}
                      {!isCreator && !isAdmin && (
                        <Link
                          to="/dashboard/fan"
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          לוח בקרה מעריץ
                        </Link>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-4 pb-3 border-t border-gray-200">
                  {user ? (
                    <div className="space-y-1">
                      {isAdmin && (
                        <Link
                          to="/dashboard/Joseph999"
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          לוח בקרה מנהל
                        </Link>
                      )}
                      {isCreator && !isAdmin && (
                        <Link
                          to="/dashboard/creator"
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          לוח בקרה ליוצר
                        </Link>
                      )}
                      {!isCreator && !isAdmin && (
                        <Link
                          to="/dashboard/fan"
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          לוח בקרה למעריץ
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50 text-right"
                      >
                        התנתק
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Link
                        to="/login"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        התחבר
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <CartComponent
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={items}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
          />
        </nav>
      );
    }
