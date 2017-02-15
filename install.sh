#!/bin/bash

cd "$(dirname "$0")"

# Installing utillities


declare -a packages=(
  "nodejs"
  "libgtk2.0-0"
  "libxtst6"
  "libxss1"
  "libgconf-2-4"
  "libnss3"
  "lxde"
  "lightdm"
  "xinit"
  "xutils"
  "xorg"
  "xterm"
)

echo "- 1 - Installing packages..."

apt-get remove nodejs nodejs-legacy -y
apt-get remove npm  -y
curl -sL https://deb.nodesource.com/setup_6.x | sudo bash

echo " "

for package in "${packages[@]}"; do
  echo "    Installing $package..."
  echo " "

  PKG_OK=$(dpkg-query -W --showformat='${Status}\n' $package|grep "install ok installed")
  if [ "" == "$PKG_OK" ]; then
    sudo apt-get --force-yes --yes install $package
  fi

  echo " "
  echo "    ✓ \"$package\" installed successfully!"
  echo " "
done

echo " "
