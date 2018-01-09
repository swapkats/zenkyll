class CreateSites < ActiveRecord::Migration[5.1]
  def change
    create_table :sites do |t|
      t.string :repo
      t.string :branch
      t.string :name
      t.belongs_to :user, foreign_key: true

      t.timestamps
    end
  end
end
