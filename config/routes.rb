Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  mount_devise_token_auth_for 'User', at: 'api/auth'
  namespace :api do
    #API ROUTES SHOULD GO HERE
  end

  get 'auth/callback/github', to: 'api#github_callback'

  #Do not place any routes below this one
  get '*other', to: 'static#index'
end
