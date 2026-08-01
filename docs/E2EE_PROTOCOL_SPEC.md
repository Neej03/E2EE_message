# CipherPulse End-to-End Encryption (E2EE) Specification

## 1. Key Primitives
* **Identity Keys**: Ed25519 (or NIST P-256 fallback in WebCrypto) keypairs generated per device for signing prekeys and message authentication.
* **Signed PreKeys**: X25519 ECDH keypairs signed by identity key, rotated weekly.
* **One-Time PreKeys**: Pool of 100+ X25519 ECDH keypairs consumed upon session initiation.
* **Ephemeral Keys**: Per-message or per-session ratcheting keys.

## 2. Session Setup (Signal Protocol Inspired)
1. **Alice** fetches **Bob**'s PreKey Bundle from the server:
   $$\text{Bundle} = (\text{IK}_B, \text{SPK}_B, \text{Sig}(\text{IK}_B, \text{SPK}_B), \text{OPK}_B)$$
2. Alice verifies Bob's signature on $\text{SPK}_B$.
3. Alice generates an ephemeral keypair $\text{EK}_A$.
4. Alice computes 4 Diffie-Hellman shared secrets:
   - $DH_1 = \text{ECDH}(\text{IK}_A, \text{SPK}_B)$
   - $DH_2 = \text{ECDH}(\text{EK}_A, \text{IK}_B)$
   - $DH_3 = \text{ECDH}(\text{EK}_A, \text{SPK}_B)$
   - $DH_4 = \text{ECDH}(\text{EK}_A, \text{OPK}_B)$
5. Combined Master Secret derived via HKDF-SHA256:
   $$\text{SK} = \text{HKDF-SHA256}(DH_1 \,\|\, DH_2 \,\|\, DH_3 \,\|\, DH_4)$$

## 3. Double Ratchet Algorithm
* **KDF Chain Ratchet**: Advances Chain Key (CK) for every message sent/received.
* **DH Ratchet**: Advances Root Key (RK) whenever an ephemeral key header is received.
* **Symmetric Message Cipher**: AES-256-GCM with 96-bit random IV and 128-bit authentication tag.

## 4. Megolm Group Key Distribution
* For group chats, each member generates a **Sender Key** (32-byte seed + 32-byte chain key).
* Sender Key is distributed to group members over individual E2EE 1-on-1 sessions.
* When a member leaves the group, the group key is immediately rotated.

## 5. Fingerprint Verification (Safety Numbers)
The 60-digit safety number is derived by sorting both identity public keys:
$$\text{Fingerprint} = \text{SHA-256}(\text{Sort}(\text{IK}_A, \text{IK}_B)) \pmod{10^5}$$
