class AddScopeToTokens < ActiveRecord::Migration[5.1]
  def change
    add_column :tokens, :scope, :string
  end
end
