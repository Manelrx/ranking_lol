#!/bin/bash

# RiftScore - Raspberry Pi Swap Helper
# Increases Swap to 2GB to support Next.js builds.

echo "🍓 Setting up Swap for Raspberry Pi..."

# Check if running as root
if [ "$EUID" -ne 0 ]
  then echo "❌ Please run as root (sudo ./setup-swap.sh)"
  exit
fi

echo "🔄 Turning off current swap..."
dphys-swapfile swapoff

echo "📝 Modifying /etc/dphys-swapfile..."
sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile

echo "⚙️  Initializing new swap file..."
dphys-swapfile setup

echo "✅ Turning on new swap..."
dphys-swapfile swapon

echo "📊 Verification:"
free -h

echo "🎉 Done! You are ready to build."
