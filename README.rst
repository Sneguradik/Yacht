Deployment Instructions
=======================

Prerequisites
-------------
1. Ensure you have SSH access to the server.
2. Copy your SSH key to the server's `authorized_keys` file for the `root` user:

   .. code-block:: bash

      ssh-copy-id root@217.114.11.70

Deployment Steps
----------------
1. Run the deployment script:

   .. code-block:: bash

      bash ./sync.sh

2. Once the deployment is complete, check the application by opening:

   .. code-block:: 

      http://217.114.11.70

   in your browser.

Notes
-----
- The script checks for Java 11, Node.js v16.14.x, and ensures Docker is running before proceeding.
- It builds both backend and frontend, then deploys them to the remote server.
- Docker Compose is used to build and restart the application on the server.


