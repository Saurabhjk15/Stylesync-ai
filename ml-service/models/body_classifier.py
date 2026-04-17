"""
Body Type Classifier Model
Uses MobileNetV2 with transfer learning for 5-class classification
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model

def create_model(num_classes=5, input_shape=(224, 224, 3)):
    """
    Create body type classification model using transfer learning
    
    Args:
        num_classes: Number of body type classes (default: 5)
        input_shape: Input image shape (default: 224x224x3)
    
    Returns:
        Compiled Keras model
    """
    # Load pre-trained MobileNetV2 (without top classification layer)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape
    )
    
    # Freeze base model layers (transfer learning)
    base_model.trainable = False
    
    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu', name='dense_1')(x)
    x = Dropout(0.3, name='dropout_1')(x)
    x = Dense(64, activation='relu', name='dense_2')(x)
    x = Dropout(0.2, name='dropout_2')(x)
    predictions = Dense(num_classes, activation='softmax', name='output')(x)
    
    # Create final model
    model = Model(inputs=base_model.input, outputs=predictions)
    
    return model

def compile_model(model, learning_rate=0.001):
    """
    Compile model with optimizer and loss function
    
    Args:
        model: Keras model to compile
        learning_rate: Learning rate for optimizer
    
    Returns:
        Compiled model
    """
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_k_categorical_accuracy']
    )
    
    return model

def create_and_compile_model( num_classes=5, input_shape=(224, 224, 3), learning_rate=0.001):
    """
    Create and compile model in one step
    
    Returns:
        Compiled Keras model ready for training
    """
    model = create_model(num_classes=num_classes, input_shape=input_shape)
    model = compile_model(model, learning_rate=learning_rate)
    
    print("✅ Model created successfully!")
    print(f"📊 Input shape: {input_shape}")
    print(f"🎯 Output classes: {num_classes}")
    print(f"Total parameters: {model.count_params():,}")
    
    return model

def unfreeze_base_model(model, num_layers_to_unfreeze=20):
    """
    Unfreeze top layers of base model for fine-tuning
    
    Args:
        model: Compiled model
        num_layers_to_unfreeze: Number of layers to unfreeze from top
    
    Returns:
        Model with unfrozen layers
    """
    # Get base model (first layer)
    base_model = model.layers[0]
    
    # Unfreeze top layers
    for layer in base_model.layers[-num_layers_to_unfreeze:]:
        layer.trainable = True
    
    print(f"✅ Unfroze top {num_layers_to_unfreeze} layers for fine-tuning")
    
    return model

if __name__ == '__main__':
    # Test model creation
    print("🧪 Testing model creation...")
    
    model = create_and_compile_model()
    model.summary()
    
    print("\n✅ Model test successful!")
