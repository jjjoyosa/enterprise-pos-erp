import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeIngredient {
  materialProductId: mongoose.Types.ObjectId; 
  quantity: number;                            
}

export interface IRecipe extends Document {
  tenantId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;        
  ingredients: IRecipeIngredient[];
}

const RecipeSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    ingredients: [
      {
        materialProductId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 0.001 },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);