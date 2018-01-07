class User < ActiveRecord::Base
  # Include default devise modules.
  has_many :token
  devise :database_authenticatable, :registerable,
          :recoverable, :rememberable, :trackable, :validatable,
          :omniauthable
  include DeviseTokenAuth::Concerns::User
end
