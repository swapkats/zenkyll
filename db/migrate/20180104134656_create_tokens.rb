class CreateTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :tokens do |t|
      t.belongs_to :user, foreign_key: true
      t.string :provider
      t.string :token

      t.timestamps
    end
  end
end
