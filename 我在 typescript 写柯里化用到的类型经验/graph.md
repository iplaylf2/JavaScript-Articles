```mermaid
flowchart LR

  any --- unknown 

  unknown --- boolean --- never
  unknown --- number --- never
  unknown --- string --- never
  unknown --- object --- x1[...] --- never
  unknown --- x2[...] --- never

  object --- animal
  animal --- cat --- x3[...] --- never
  animal --- dog --- x4[...] --- never
  animal --- x5[...] --- never

  never --- any

```
