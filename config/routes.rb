Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'api/auth'
  namespace :api do
    #API ROUTES SHOULD GO HERE
  end

  get 'auth/callback/github', to: 'application#github_callback'

  #Do not place any routes below this one
  get '*other', to: 'static#index'
end
